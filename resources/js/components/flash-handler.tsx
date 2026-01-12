import { useEffect } from 'react';
import { toast } from 'sonner';

interface FlashMessage {
    success?: string;
    error?: string;
}

interface InertiaFlashEvent extends Event {
    detail: {
        flash: FlashMessage;
    };
}

export function FlashHandler() {
    useEffect(() => {
        const handleFlash = (event: Event) => {
            const inertiaEvent = event as InertiaFlashEvent;
            const { flash } = inertiaEvent.detail;

            if (flash.success) {
                toast.success(flash.success);
            }
            if (flash.error) {
                toast.error(flash.error);
            }
        };

        // Listen for Inertia's global flash event using native browser events
        // Inertia v2 uses native events under the hood (prefixed with 'inertia:')
        document.addEventListener('inertia:flash', handleFlash);

        // Cleanup listener on unmount
        return () => {
            document.removeEventListener('inertia:flash', handleFlash);
        };
    }, []);

    return null;
}
