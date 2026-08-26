'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { StatCard } from '@/components/ui/StatCard';
import { useApp } from '@/context/AppContext';
import { Appointment, AppointmentStatus } from '@/types';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  Wrench, 
  Trash2,
  FileText
} from 'lucide-react';

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    appointments, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    upcomingAppointmentsCount 
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get('action') === 'create');
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState('HVAC Maintenance');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [technicianName, setTechnicianName] = useState('Dave Miller');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const selectedApt = useMemo(() => {
    return appointments.find(a => a.id === selectedAptId) || null;
  }, [appointments, selectedAptId]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      return true;
    });
  }, [appointments, statusFilter]);

  const handleCreateAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerName.trim()) return;

    await addAppointment({
      title,
      customerName,
      customerPhone,
      serviceType,
      startTime,
      endTime,
      technicianName,
      address: address || '123 Service Ln',
      status: 'SCHEDULED',
      notes,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
    setNotes('');
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'title',
      header: 'Service & Customer',
      sortable: true,
      render: (apt) => (
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-on-surface hover:text-primary transition-colors block">
              {apt.title}
            </span>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
              <span>{apt.customerName}</span>
              {apt.customerPhone && (
                <span className="flex items-center gap-0.5 text-outline">
                  <Phone className="w-3 h-3" /> {apt.customerPhone}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'timeWindow',
      header: 'Time Window',
      render: (apt) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
          <Clock className="w-3.5 h-3.5 text-outline" />
          <span>{apt.startTime} – {apt.endTime}</span>
        </div>
      ),
    },
    {
      key: 'technicianName',
      header: 'Technician Assigned',
      sortable: true,
      render: (apt) => (
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
          <User className="w-3.5 h-3.5 text-outline" />
          <span>{apt.technicianName || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Service Location',
      render: (apt) => (
        <div className="flex items-center gap-1 text-xs text-on-surface-variant max-w-[200px] truncate">
          <MapPin className="w-3.5 h-3.5 text-outline shrink-0" />
          <span className="truncate">{apt.address}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (apt) => <Badge appointmentStatus={apt.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (apt) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedAptId(apt.id)}
            className="px-2.5 py-1 text-xs font-bold text-primary bg-primary-fixed/20 hover:bg-primary-fixed/40 rounded-lg transition-colors"
          >
            Manage
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell title="Service Appointments">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <PageHeader
          title="Service Schedule & Field Dispatch"
          subtitle="Manage technician assignments, client visits, and on-site job bookings"
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              + Book Appointment
            </Button>
          }
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Scheduled"
            value={appointments.length}
            subtext="All calendar entries"
            icon={<Calendar className="w-4 h-4 text-teal-600" />}
          />
          <StatCard
            label="Upcoming Visits"
            value={upcomingAppointmentsCount}
            subtext="Scheduled or confirmed"
            icon={<Clock className="w-4 h-4 text-primary" />}
            variant="primary"
          />
          <StatCard
            label="Completed Visits"
            value={appointments.filter(a => a.status === 'COMPLETED').length}
            subtext="Delivered successfully"
            icon={<CheckCircle2 className="w-4 h-4 text-tertiary" />}
            variant="success"
          />
          <StatCard
            label="Field Technicians"
            value="3 Active"
            subtext="Dave, Carlos, Marcus"
            icon={<User className="w-4 h-4 text-amber-600" />}
          />
        </div>

        {/* DataTable */}
        <DataTable
          data={filteredAppointments}
          columns={columns}
          searchPlaceholder="Search appointments by customer, technician, or title..."
          searchFilter={(apt, query) =>
            apt.title.toLowerCase().includes(query) ||
            apt.customerName.toLowerCase().includes(query) ||
            apt.technicianName.toLowerCase().includes(query) ||
            apt.address.toLowerCase().includes(query)
          }
          filterComponent={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Statuses ({appointments.length})</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          }
          onRowClick={(apt) => setSelectedAptId(apt.id)}
          emptyTitle="No appointments found"
          emptyDescription="Schedule a new service appointment."
          emptyAction={
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              + Book Appointment
            </Button>
          }
        />
      </div>

      {/* Appointment Drawer */}
      <Drawer
        isOpen={!!selectedApt}
        onClose={() => setSelectedAptId(null)}
        title={selectedApt?.title || 'Appointment Details'}
        subtitle={`Scheduled: ${selectedApt?.startTime} - ${selectedApt?.endTime}`}
        size="md"
        footer={
          selectedApt && (
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  deleteAppointment(selectedApt.id);
                  setSelectedAptId(null);
                }}
                className="p-2 text-error hover:bg-error-container/20 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Cancel / Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    router.push(`/invoices/create?customerName=${encodeURIComponent(selectedApt.customerName)}`);
                  }}
                  leftIcon={<FileText className="w-3.5 h-3.5" />}
                >
                  Create Invoice
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedApt && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                  Status
                </span>
                <div className="mt-1">
                  <Badge appointmentStatus={selectedApt.status} size="md" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                  Technician
                </span>
                <span className="text-sm font-bold text-on-surface">
                  {selectedApt.technicianName}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                Update Appointment Status:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as AppointmentStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateAppointment({ ...selectedApt, status: st })}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all truncate text-center ${
                      selectedApt.status === st
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant space-y-2.5 text-xs">
              <h4 className="font-bold text-on-surface uppercase tracking-wider">Visit Info</h4>
              <p><strong className="text-on-surface">Customer:</strong> {selectedApt.customerName}</p>
              <p><strong className="text-on-surface">Phone:</strong> {selectedApt.customerPhone || 'None'}</p>
              <p><strong className="text-on-surface">Address:</strong> {selectedApt.address}</p>
              <p><strong className="text-on-surface">Service Type:</strong> {selectedApt.serviceType}</p>
              {selectedApt.notes && (
                <div className="pt-2 border-t border-outline-variant/60">
                  <strong className="text-on-surface">Dispatch Notes:</strong>
                  <p className="text-on-surface-variant italic mt-0.5">{selectedApt.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Service Visit"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateAppointmentSubmit}>
              Schedule Visit
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAppointmentSubmit} className="space-y-4">
          <Input
            label="Service Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AC Seasonal Tune-up"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rachel Green"
              required
            />
            <Input
              label="Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Window"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="09:00 AM"
            />
            <Input
              label="End Window"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="11:00 AM"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Service Type
              </label>
              <input
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="HVAC / Plumbing / Electrical"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                Assign Technician
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="Dave Miller"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <Input
            label="Service Location Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Service Dr, Austin, TX"
          />

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Access / Job Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gate code, dog on premises, equipment location..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-outline">Loading appointments...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
