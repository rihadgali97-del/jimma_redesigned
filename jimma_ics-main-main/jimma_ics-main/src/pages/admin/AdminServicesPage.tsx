import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Building,
  Phone,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ServiceRequest } from '../../types';

export const AdminServicesPage: React.FC = () => {
  const { serviceRequests, updateServiceRequestStatus, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<ServiceRequest['status']>('In Review');
  const [assignedOfficer, setAssignedOfficer] = useState('');

  const filtered = serviceRequests.filter((r) => {
    const s = (searchTerm || '').toLowerCase();
    const matchSearch =
      (r.applicantName || '').toLowerCase().includes(s) ||
      (r.trackingNo || '').toLowerCase().includes(s) ||
      (r.serviceName || '').toLowerCase().includes(s) ||
      (r.district || '').toLowerCase().includes(s);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Public Civic Services & Applications Desk
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Review Nikah certificates, Zakat hardship claims, Janazah dispatch, and Shari'ah arbitration cases.
          </p>
        </div>
      </div>

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
          <option value="Pending">Pending</option>
          <option value="In Review">In Review</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
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
                <th className="p-3.5">District</th>
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
                    {req.serviceName}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      {req.applicantName}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">{req.phone}</span>
                  </td>
                  <td className="p-3.5 text-stone-600 dark:text-stone-300 font-medium">
                    {req.district}
                  </td>
                  <td className="p-3.5 text-stone-700 dark:text-stone-300">
                    {req.assignedOfficer}
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        req.status === 'Completed'
                          ? 'emerald'
                          : req.status === 'Approved'
                          ? 'teal'
                          : req.status === 'In Review'
                          ? 'blue'
                          : req.status === 'Pending'
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
          subtitle={`${selectedRequest.serviceName} • Applicant: ${selectedRequest.applicantName}`}
        >
          <form onSubmit={handleSaveReview} className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Applicant:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {selectedRequest.applicantName} ({selectedRequest.phone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">District:</span>
                <span className="font-semibold">{selectedRequest.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Submitted:</span>
                <span className="font-mono">{selectedRequest.submissionDate}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 block mb-1">Details / Notes:</span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                  {selectedRequest.details}
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
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
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
              <Button variant="primary" type="submit">
                Save Case Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
