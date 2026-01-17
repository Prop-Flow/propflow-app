/**
 * Demo Mode Configuration
 * 
 * Utilities for detecting and managing demo mode state.
 * Demo mode enables a streamlined experience with mock data for demonstrations.
 */

/**
 * Unique identifier for the demo user account.
 * All demo data is namespaced under this user ID for easy cleanup.
 */
export const DEMO_USER_ID = 'demo_user_propflow_2026';

/**
 * Checks if the application is running in demo mode.
 * 
 * Demo mode is enabled when:
 * 1. NEXT_PUBLIC_DEMO_MODE environment variable is set to 'true', OR
 * 2. URL query parameter 'demo' is set to '1'
 * 
 * @returns {boolean} True if demo mode is active
 */
export function isDemoMode(): boolean {
    // Check environment variable
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        return true;
    }

    // Check URL parameter (client-side only)
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('demo') === '1';
    }

    return false;
}

/**
 * Gets the demo mode indicator for display purposes.
 * 
 * @returns {string | null} Demo mode label or null if not in demo mode
 */
export function getDemoModeLabel(): string | null {
    return isDemoMode() ? 'DEMO MODE' : null;
}
