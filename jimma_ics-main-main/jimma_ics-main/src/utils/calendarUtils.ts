import { CouncilEvent } from '../types';

/**
 * Generates an iCalendar (.ics) file string and initiates browser download
 */
export function downloadEventIcs(event: CouncilEvent) {
  // Format dates: YYYYMMDDTHHMMSSZ or YYYYMMDD
  const dateParts = event.date.split('-');
  if (dateParts.length !== 3) return;

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  const dtStart = `${year}${month}${day}T053000Z`; // approximate start
  const dtEnd = `${year}${month}${day}T140000Z`;   // approximate end
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const cleanDescription = (event.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,');
  const cleanTitle = (event.title || '').replace(/,/g, '\\,');
  const cleanLocation = `${event.location || ''}, ${event.district || ''}, Jimma, Ethiopia`.replace(/,/g, '\\,');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jimma Zone Islamic Affairs Supreme Council//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:event-${event.id}-${Date.now()}@jimma-islamicaffairs.et`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Jimma Islamic Council Event Tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds a direct Google Calendar Add Event URL
 */
export function getGoogleCalendarUrl(event: CouncilEvent): string {
  const dateFormatted = event.date.replace(/-/g, '');
  const dates = `${dateFormatted}T083000/${dateFormatted}T170000`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: dates,
    details: `${event.description}\n\nOrganizer: ${event.organizer}\nKeynote: ${event.speaker}\nHijri Date: ${event.hijriDate}`,
    location: `${event.location}, ${event.district}, Jimma, Ethiopia`,
    sprop: 'website:https://jimma-islamicaffairs.et',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
