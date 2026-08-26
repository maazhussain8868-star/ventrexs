/**
 * ==============================================================================
 * PAYPILOT AI — AI RECEPTIONIST APPOINTMENT VALIDATOR
 * Real-time business hours, conflicting bookings & slot availability validation
 * ==============================================================================
 */

import { Appointment, BusinessHours } from '@/types';

export interface BookingValidationResult {
  isValid: boolean;
  error?: string;
  normalizedStartTime?: string;
  normalizedEndTime?: string;
}

export interface SlotAvailabilityParams {
  businessHours?: BusinessHours;
  existingAppointments: Appointment[];
  leadTimeHours?: number;
  maxDaysAhead?: number;
  serviceDurationMinutes?: number;
  daysToGenerate?: number;
}

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '09:00', close: '15:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
};

/**
 * Validates a proposed appointment time against business hours, buffer limits, and conflicting appointments.
 */
export function validateProposedAppointment(
  proposedStart: string | Date,
  durationMinutes: number = 60,
  existingAppointments: Appointment[] = [],
  businessHours: BusinessHours = DEFAULT_HOURS,
  leadTimeHours: number = 2,
  maxDaysAhead: number = 14
): BookingValidationResult {
  const startDate = new Date(proposedStart);

  if (isNaN(startDate.getTime())) {
    return { isValid: false, error: 'Invalid appointment date format' };
  }

  const now = new Date();
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  // 1. Check in past
  if (startDate.getTime() <= now.getTime()) {
    return { isValid: false, error: 'Appointment time must be in the future' };
  }

  // 2. Check minimum lead time
  const minAllowedTime = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);
  if (startDate.getTime() < minAllowedTime.getTime()) {
    return {
      isValid: false,
      error: `Appointments must be booked at least ${leadTimeHours} hours in advance`,
    };
  }

  // 3. Check maximum days ahead
  const maxAllowedTime = new Date(now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000);
  if (startDate.getTime() > maxAllowedTime.getTime()) {
    return {
      isValid: false,
      error: `Appointments can only be scheduled up to ${maxDaysAhead} days in advance`,
    };
  }

  // 4. Check Business Hours
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayName = daysOfWeek[startDate.getDay()];
  const daySchedule = businessHours?.[dayName] || DEFAULT_HOURS[dayName];

  if (!daySchedule || daySchedule.closed) {
    return {
      isValid: false,
      error: `Our office is closed on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}s`,
    };
  }

  // Convert open/close to minutes from midnight
  const [openH, openM] = (daySchedule.open || '08:00').split(':').map(Number);
  const [closeH, closeM] = (daySchedule.close || '18:00').split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

  if (startMinutes < openMinutes || endMinutes > closeMinutes) {
    return {
      isValid: false,
      error: `Appointment must fall within operating hours (${daySchedule.open} - ${daySchedule.close})`,
    };
  }

  // 5. Check conflicting existing appointments
  const hasConflict = existingAppointments.some((apt) => {
    if (apt.status === 'CANCELLED') return false;
    const existingStart = new Date(apt.startTime).getTime();
    const existingEnd = new Date(apt.endTime).getTime();

    // Overlap condition: start < existingEnd && end > existingStart
    return startDate.getTime() < existingEnd && endDate.getTime() > existingStart;
  });

  if (hasConflict) {
    return {
      isValid: false,
      error: 'The requested time slot conflicts with an existing appointment',
    };
  }

  return {
    isValid: true,
    normalizedStartTime: startDate.toISOString(),
    normalizedEndTime: endDate.toISOString(),
  };
}

/**
 * Generates available appointment windows for the next few days.
 */
export function generateAvailableSlots(
  params: SlotAvailabilityParams
): { date: string; slots: string[] }[] {
  const {
    businessHours = DEFAULT_HOURS,
    existingAppointments = [],
    leadTimeHours = 2,
    maxDaysAhead = 7,
    serviceDurationMinutes = 60,
    daysToGenerate = 3,
  } = params;

  const results: { date: string; slots: string[] }[] = [];
  const now = new Date();

  for (let d = 1; d <= Math.min(daysToGenerate, maxDaysAhead); d++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + d);

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const dayName = daysOfWeek[targetDate.getDay()];
    const daySchedule = businessHours?.[dayName] || DEFAULT_HOURS[dayName];

    if (!daySchedule || daySchedule.closed) continue;

    const [openH, openM] = (daySchedule.open || '08:00').split(':').map(Number);
    const [closeH, closeM] = (daySchedule.close || '18:00').split(':').map(Number);

    const availableSlotsForDay: string[] = [];

    // Check hourly slots between open and close
    for (let h = openH; h < closeH; h += Math.ceil(serviceDurationMinutes / 60)) {
      targetDate.setHours(h, 0, 0, 0);

      const check = validateProposedAppointment(
        targetDate,
        serviceDurationMinutes,
        existingAppointments,
        businessHours,
        leadTimeHours,
        maxDaysAhead
      );

      if (check.isValid) {
        const timeString = targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        availableSlotsForDay.push(timeString);
      }
    }

    if (availableSlotsForDay.length > 0) {
      results.push({
        date: targetDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
        slots: availableSlotsForDay.slice(0, 4), // Return top 4 slots
      });
    }
  }

  return results;
}
