// Simple mock toast hook
export function useToast() {
    return {
        toast: (props: { title?: string; description?: string; variant?: string }) => {
            console.log('TOAST:', props);
            // In a real app we'd dispatch to a context
        }
    };
}
