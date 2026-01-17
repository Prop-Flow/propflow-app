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
 * MVP Demo email address (allowlisted for activation features).
 * This account gets the special onboarding flow with activation gating.
 */
export const MVP_DEMO_EMAIL = 'demo@propflow.com';

/**
 * User profile interface with demo flags.
 */
export interface DemoUserProfile {
    email?: string;
    demoProfile?: 'mvp_demo' | null;
    demoActivated?: boolean;
}

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
 * Checks if a user is the MVP Demo account.
 * 
 * @param email - User's email address
 * @returns {boolean} True if user is MVP demo
 */
export function isMVPDemoUser(email?: string): boolean {
    return email === MVP_DEMO_EMAIL;
}

/**
 * Checks if demo has been activated for a user.
 * 
 * @param user - User profile with activation flag
 * @returns {boolean} True if demo is activated
 */
export function isDemoActivated(user?: DemoUserProfile): boolean {
    return user?.demoActivated === true;
}

/**
 * Checks if user should see empty state onboarding.
 * 
 * @param user - User profile
 * @param hasProperties - Whether user has any properties
 * @returns {boolean} True if should show empty state
 */
export function shouldShowEmptyState(user?: DemoUserProfile, hasProperties: boolean = false): boolean {
    // Show empty state if no properties
    if (!hasProperties) {
        return true;
    }

    // For MVP demo user, show empty state until activated
    if (isMVPDemoUser(user?.email) && !isDemoActivated(user)) {
        return true;
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
