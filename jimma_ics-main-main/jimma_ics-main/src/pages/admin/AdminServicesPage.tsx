import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  Search,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ServiceRequest } from '../../types';
import { mockPublicServices, ServiceItem } from '../../data/mockServices';
import {
  fetchAdminJanazahAvailability,
  setJanazahAvailability,
} from '../../services/janazahApi';
import {
  CivicPublicServiceId,
  CIVIC_PUBLIC_SERVICE_IDS,
  fetchAdminCivicServiceAvailability,
  isCivicPublicServiceId,
  setCivicServiceAvailability,
} from '../../services/civicServicesApi';

export const AdminServicesPage: React.FC = () => {
  const {
    serviceRequests,
    updateServiceRequestStatus,
    addToast,
    janazahPublicEnabled,
    refreshJanazahAvailability,
    refreshPublicServiceAvailability,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<ServiceRequest['status']>('Under Review');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [janazahEnabled, setJanazahEnabled] = useState(janazahPublicEnabled);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [togglingJanazah, setTogglingJanazah] = useState(false);
  const [serviceAvailability, setServiceAvailability] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CIVIC_PUBLIC_SERVICE_IDS.map((serviceId) => [serviceId, true]))
  );
  const [servicesAvailabilityLoading, setServicesAvailabilityLoading] = useState(true);
  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);

  const loadJanazahAvailability = useCallback(async () => {
    setAvailabilityLoading(true);
    try {
      const availability = await fetchAdminJanazahAvailability();
      setJanazahEnabled(availability.isEnabled);
      await refreshJanazahAvailability();
    } catch (error) {
      setJanazahEnabled(janazahPublicEnabled);
      if (import.meta.env.DEV) {
        console.warn('[API] Could not load Janazah availability.', error);
      }
    } finally {
      setAvailabilityLoading(false);
    }
  }, [janazahPublicEnabled, refreshJanazahAvailability]);

  useEffect(() => {
    void loadJanazahAvailability();
  }, [loadJanazahAvailability]);

  const loadOtherServiceAvailability = async () => {
    setServicesAvailabilityLoading(true);
    try {
      const settings = await fetchAdminCivicServiceAvailability();
      setServiceAvailability((previous) => ({
        ...previous,
        ...Object.fromEntries(settings.map(({ serviceKey, isEnabled }) => [serviceKey, isEnabled])),
      }));
    } catch (error) {
      addToast(
        'Could not load public service availability',
        error instanceof Error ? error.message : 'Please try again.',
        'error'
      );
    } finally {
      setServicesAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    void loadOtherServiceAvailability();
  }, []);

  const filtered = serviceRequests.filter((r) => {
    const s = (searchTerm || '').toLowerCase();
    const matchSearch =
      (r.applicantName || '').toLowerCase().includes(s) ||
      (r.trackingNo || '').toLowerCase().includes(s) ||
      (r.serviceType || '').toLowerCase().includes(s) ||
      (r.applicantDistrict || '').toLowerCase().includes(s);
    const matchStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenReview = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setAssignedOfficer(req.assignedOfficer);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    updateServiceRequestStatus(selectedRequest.id, newStatus, assignedOfficer);
    setSelectedRequest(null);
  };

  const handleToggleJanazah = async () => {
    const next = !janazahEnabled;
    setTogglingJanazah(true);
    try {
      const updated = await setJanazahAvailability(next);
      setJanazahEnabled(updated.isEnabled);
      await refreshJanazahAvailability();
      addToast(
        next ? 'Janazah intake enabled' : 'Janazah intake disabled',
        next
          ? 'The public Janazah request form is now available on the Services page.'
          : 'The public Janazah request form is hidden and new online submissions are blocked.',
        'success'
      );
    } catch (error) {
      addToast(
        'Could not update Janazah availability',
        error instanceof Error ? error.message : 'Please try again.',
        'error'
      );
    } finally {
      setTogglingJanazah(false);
    }
  };

  const handleToggleService = async (serviceId: CivicPublicServiceId, serviceTitle: string) => {
    const next = serviceAvailability[serviceId] === false;
    setTogglingServiceId(serviceId);
    try {
      const updated = await setCivicServiceAvailability(serviceId, next);
      setServiceAvailability((previous) => ({
        ...previous,
        [updated.serviceKey]: updated.isEnabled,
      }));
      await refreshPublicServiceAvailability();
      addToast(
        `${serviceTitle} ${updated.isEnabled ? 'enabled' : 'disabled'}`,
        updated.isEnabled
          ? 'This service is now visible on the public Services page.'
          : updated.serviceKey === 'srv-2'
            ? 'This service is hidden from the public Services page and new Zakat submissions are blocked.'
            : 'This service is hidden from the public Services page.',
        'success'
      );
    } catch (error) {
      addToast(
        'Could not update public service availability',
        error instanceof Error ? error.message : 'Please try again.',
        'error'
      );
    } finally {
      setTogglingServiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Public Civic Services & Applications Desk
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Review Zakat hardship claims, Janazah dispatch, Islamic counselling, and Shari'ah arbitration cases.
          </p>
        </div>
      </div>

      {/* Janazah public intake on/off */}
      <Card className="p-4 sm:p-5 border-rose-200/70 dark:border-rose-900/50 bg-gradient-to-r from-rose-50/80 via-white to-stone-50 dark:from-rose-950/30 dark:via-stone-900 dark:to-stone-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif font-bold text-stone-900 dark:text-stone-100">
                  Janazah Public Intake
                </h2>
                <Badge variant={janazahEnabled ? 'emerald' : 'rose'}>
                  {availabilityLoading ? 'Checking…' : janazahEnabled ? 'Online form ON' : 'Online form OFF'}
                </Badge>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
                When ON, families can submit urgent Janazah requests from the public Services page.
                When OFF, the Janazah catalogue card is hidden and the API rejects new online submissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${availabilityLoading ? 'animate-spin' : ''}`} />}
              onClick={() => void loadJanazahAvailability()}
              disabled={availabilityLoading || togglingJanazah}
            >
              Refresh
            </Button>
            <button
              type="button"
              role="switch"
              aria-checked={janazahEnabled}
              disabled={availabilityLoading || togglingJanazah}
              onClick={() => void handleToggleJanazah()}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 ${
                janazahEnabled ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
              }`}
              title={janazahEnabled ? 'Turn Janazah public intake off' : 'Turn Janazah public intake on'}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  janazahEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-stone-900 dark:text-stone-100">
              Other Public Service Availability
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Toggle a service off to hide it from the public catalogue. Zakat submissions are also rejected while its intake is off.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${servicesAvailabilityLoading ? 'animate-spin' : ''}`} />}
            onClick={() => void loadOtherServiceAvailability()}
            disabled={servicesAvailabilityLoading || togglingServiceId !== null}
          >
            Refresh
          </Button>
        </div>

        <div className="divide-y divide-stone-200 dark:divide-stone-800">
          {mockPublicServices
            .filter(
              (service): service is ServiceItem & { id: CivicPublicServiceId } =>
                isCivicPublicServiceId(service.id)
            )
            .map((service) => {
              const isEnabled = serviceAvailability[service.id] !== false;
              const isToggling = togglingServiceId === service.id;
              return (
                <div key={service.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {service.title}
                      </h3>
                      <Badge variant={isEnabled ? 'emerald' : 'rose'}>
                        {servicesAvailabilityLoading ? 'Checking…' : isEnabled ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{service.category}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${service.title}`}
                    aria-checked={isEnabled}
                    disabled={servicesAvailabilityLoading || isToggling || togglingServiceId !== null}
                    onClick={() => void handleToggleService(service.id, service.title)}
                    className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 ${
                      isEnabled ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                    title={isEnabled ? `Turn ${service.title} off` : `Turn ${service.title} on`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                        isEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracking #, applicant, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
        >
          <option value="All">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Disbursed">Disbursed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Requests Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="p-3.5">Tracking No</th>
                <th className="p-3.5">Service Requested</th>
                <th className="p-3.5">Applicant Details</th>
                <th className="p-3.5">Kebele</th>
                <th className="p-3.5">Assigned Officer</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                  <td className="p-3.5 font-mono font-bold text-stone-900 dark:text-stone-100">
                    {req.trackingNo}
                  </td>
                  <td className="p-3.5 font-serif font-bold text-stone-800 dark:text-stone-200">
                    {req.serviceType}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      {req.applicantName}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">{req.applicantPhone}</span>
                  </td>
                  <td className="p-3.5 text-stone-600 dark:text-stone-300 font-medium">
                    {req.applicantDistrict}
                  </td>
                  <td className="p-3.5 text-stone-700 dark:text-stone-300">
                    {req.assignedOfficer}
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        req.status === 'Completed' || req.status === 'Disbursed'
                          ? 'emerald'
                          : req.status === 'Approved'
                          ? 'teal'
                          : req.status === 'Under Review'
                          ? 'blue'
                          : req.status === 'Submitted'
                          ? 'gold'
                          : 'rose'
                      }
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenReview(req)}
                      className="text-xs"
                    >
                      Review Case
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Modal */}
      {selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title={`Review Case: ${selectedRequest.trackingNo}`}
          subtitle={`${selectedRequest.serviceType} • Applicant: ${selectedRequest.applicantName}`}
        >
          <form onSubmit={handleSaveReview} className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Applicant:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {selectedRequest.applicantName} ({selectedRequest.applicantPhone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Kebele:</span>
                <span className="font-semibold">{selectedRequest.applicantDistrict}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Submitted:</span>
                <span className="font-mono">{selectedRequest.submissionDate}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 block mb-1">Details / Notes:</span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                  {selectedRequest.notes}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Update Case Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ServiceRequest['status'])}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Disbursed">Disbursed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Assign Officer / Desk
                </label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <Button variant="ghost" type="button" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<FileCheck2 className="w-4 h-4" />}>
                Save Case Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
