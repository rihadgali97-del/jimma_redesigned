import { jest } from '@jest/globals';

const mockRepository = {
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  register: jest.fn(),
  findRegistrations: jest.fn(),
  findRegistrationById: jest.fn(),
  updateRegistrationStatus: jest.fn(),
};
const mockWriteAuditLog = jest.fn();
const mockQueueEventNotifications = jest.fn();
const mockQueueRegistrationConfirmation = jest.fn();
const mockCancelQueuedEventNotifications = jest.fn();

jest.unstable_mockModule('../src/modules/events/events.repository.js', () => ({ eventsRepository: mockRepository }));
jest.unstable_mockModule('../src/common/utils/auditLog.js', () => ({ writeAuditLog: mockWriteAuditLog }));
jest.unstable_mockModule('../src/modules/notifications/notifications.service.js', () => ({
  queueEventNotifications: mockQueueEventNotifications,
  queueRegistrationConfirmation: mockQueueRegistrationConfirmation,
  cancelQueuedEventNotifications: mockCancelQueuedEventNotifications,
}));

const eventsService = await import('../src/modules/events/events.service.js');
const { createEventSchema, registerForEventSchema } = await import('../src/modules/events/events.validation.js');

const event = {
  id: 42,
  title: 'Community Lecture',
  arabicTitle: null,
  category: 'Lecture',
  date: new Date('2026-11-10T00:00:00.000Z'),
  hijriDate: '1448-05-29',
  time: '09:00',
  location: 'Jimma Central Mosque',
  venueDetails: null,
  district: 'Jimma',
  organizer: 'Council',
  speaker: 'Ustadh Ahmed',
  description: 'A community lecture.',
  maxCapacity: 100,
  registeredSeats: 4,
  isFeatured: false,
  image: '',
  registrationOpen: true,
  status: 'Upcoming',
  format: null,
  entryFee: null,
  targetAudience: null,
  livestreamUrl: null,
  contactPhone: null,
  contactEmail: null,
  schedule: [],
  speakersList: [],
  tags: [],
  materials: [],
  isPublished: true,
};

beforeEach(() => jest.clearAllMocks());

describe('Events service', () => {
  it('maps database events to the public event shape', async () => {
    mockRepository.findById.mockResolvedValue(event);

    await expect(eventsService.getEvent(42)).resolves.toMatchObject({
      id: '42',
      date: '2026-11-10',
      attendeesCount: 4,
      title: 'Community Lecture',
    });
  });

  it('does not expose an unpublished event publicly', async () => {
    mockRepository.findById.mockResolvedValue({ ...event, isPublished: false });

    await expect(eventsService.getEvent(42)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('cancels queued reminders after deleting an event', async () => {
    mockRepository.findById.mockResolvedValue(event);
    mockRepository.delete.mockResolvedValue(event);

    await eventsService.deleteEvent(42, 7);

    expect(mockCancelQueuedEventNotifications).toHaveBeenCalledWith(42);
  });

  it('rejects capacity reductions below existing registrations', async () => {
    mockRepository.findById.mockResolvedValue(event);

    await expect(eventsService.updateEvent(42, { maxCapacity: 3 }, 7)).rejects.toMatchObject({ statusCode: 409 });
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('maps a successful registration and writes its capacity-backed pass', async () => {
    mockRepository.register.mockImplementation(async (_eventId, _data, passNumber) => ({
      registration: {
        id: 81,
        eventId: 42,
        event,
        fullName: 'Amina Ahmed',
        phone: '+251911234567',
        email: null,
        district: 'Jimma',
        organizationOrMadrasa: null,
        attendeesCount: 2,
        notes: null,
        passNumber,
        status: 'CONFIRMED',
        createdAt: new Date('2026-10-03T10:00:00.000Z'),
      },
    }));

    const result = await eventsService.registerForEvent(42, {
      fullName: 'Amina Ahmed',
      phone: '+251911234567',
      district: 'Jimma',
      attendeesCount: 2,
    });

    expect(result).toMatchObject({ id: '81', eventId: '42', status: 'Confirmed', attendeesCount: 2 });
    expect(result.passNumber).toMatch(/^JIC-PASS-\d{4}-[A-F0-9]{10}$/);
    expect(mockRepository.register).toHaveBeenCalledWith(42, expect.objectContaining({ attendeesCount: 2 }), result.passNumber);
  });

  it('returns a conflict when there are not enough seats', async () => {
    mockRepository.register.mockResolvedValue({ full: true });

    await expect(eventsService.registerForEvent(42, {
      fullName: 'Amina Ahmed', phone: '+251911234567', district: 'Jimma', attendeesCount: 2,
    })).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('Events request validation', () => {
  const requiredEvent = {
    title: 'Community Lecture', category: 'Lecture', date: '2026-11-10', hijriDate: '', time: '09:00',
    location: 'Jimma Central Mosque', district: 'Jimma', organizer: '', speaker: '',
    description: 'A community lecture.', maxCapacity: 100, image: '', schedule: [], speakersList: [], tags: [], materials: [],
  };

  it('rejects impossible calendar dates', () => {
    expect(createEventSchema.safeParse({ body: { ...requiredEvent, date: '2026-02-30' } }).success).toBe(false);
  });

  it('rejects registrations with invalid phone numbers or seat counts', () => {
    const result = registerForEventSchema.safeParse({
      params: { id: '42' },
      body: { fullName: 'Amina Ahmed', phone: 'phone', district: 'Jimma', attendeesCount: 0 },
    });
    expect(result.success).toBe(false);
  });
});
