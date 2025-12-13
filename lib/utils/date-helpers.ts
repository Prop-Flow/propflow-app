import { format, formatDistance, addDays, differenceInDays, isBefore, isAfter } from 'date-fns';

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM dd, yyyy'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
}

/**
 * Get relative time from now (e.g., "2 days ago", "in 3 weeks")
 */
export function getRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Calculate lease renewal window (typically 90 days before expiration)
 */
export function getLeaseRenewalDate(leaseEndDate: Date | string, daysBeforeExpiry: number = 90): Date {
    const endDate = typeof leaseEndDate === 'string' ? new Date(leaseEndDate) : leaseEndDate;
    return addDays(endDate, -daysBeforeExpiry);
}

/**
 * Check if a date is within a certain number of days from now
 */
export function isWithinDays(date: Date | string, days: number): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const daysDiff = differenceInDays(dateObj, new Date());
    return daysDiff >= 0 && daysDiff <= days;
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isBefore(dateObj, new Date());
}

/**
 * Get status based on due date
 */
export function getComplianceStatus(dueDate: Date | string): 'overdue' | 'urgent' | 'upcoming' | 'future' {
    const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const daysDiff = differenceInDays(dateObj, new Date());

    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 7) return 'urgent';
    if (daysDiff <= 30) return 'upcoming';
    return 'future';
}
