/**
 * Example React Query hook for API calls
 * This demonstrates the pattern for future migration to React Query
 * 
 * To use React Query:
 * 1. Install: npm install @tanstack/react-query
 * 2. Add QueryClientProvider to app layout
 * 3. Replace fetch calls with these hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserFriendlyError } from '@/lib/utils/error-handler';

// Example: Fetch tenants with React Query
export function useTenants(propertyId?: string, status?: string) {
    return useQuery({
        queryKey: ['tenants', { propertyId, status }],
        queryFn: async () => {
            let url = '/api/tenants';
            const params = new URLSearchParams();
            if (propertyId) params.append('propertyId', propertyId);
            if (status) params.append('status', status);
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to load tenants');
            }
            const data = await res.json();
            return Array.isArray(data) ? data : data.tenants || [];
        },
        // Automatic refetching
        staleTime: 30000, // 30 seconds
        // Error handling
        retry: 2,
        retryDelay: 1000,
    });
}

// Example: Fetch properties with React Query
export function useProperties() {
    return useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const res = await fetch('/api/properties');
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to load properties');
            }
            const data = await res.json();
            return data.properties || [];
        },
        staleTime: 30000,
        retry: 2,
    });
}

// Example: Create property mutation
export function useCreateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (propertyData: any) => {
            const res = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(propertyData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create property');
            }

            return res.json();
        },
        // Automatically refetch properties after creation
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Failed to create property:', getUserFriendlyError(error));
        },
    });
}

// Example: Pending tenants
export function usePendingTenants() {
    return useQuery({
        queryKey: ['tenants', 'pending'],
        queryFn: async () => {
            const res = await fetch('/api/tenants/pending');
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to load pending tenants');
            }
            return res.json();
        },
        staleTime: 10000, // 10 seconds - more frequent for pending items
        retry: 2,
    });
}

/**
 * Usage example:
 * 
 * function TenantsPage() {
 *   const { data: tenants, isLoading, error } = useTenants();
 * 
 *   if (isLoading) return <Loader />;
 *   if (error) return <ErrorDisplay message={error.message} />;
 * 
 *   return <TenantsList tenants={tenants} />;
 * }
 */
