import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, X } from 'lucide-react';
import { router } from '@inertiajs/react';

interface ImpersonateData {
    is_impersonating: boolean;
    admin: {
        id: number;
        name: string;
        email: string;
    } | null;
    target_user: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface SharedData {
    impersonate: ImpersonateData;
    [key: string]: any;
}

export function ImpersonateBanner() {
    const { impersonate } = usePage<SharedData>().props;

    if (!impersonate?.is_impersonating) {
        return null;
    }

    const handleStopImpersonating = () => {
        router.get('/admin/users/stop-impersonate');
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-b border-orange-500/50 bg-orange-50 px-4 py-2 text-sm shadow-lg dark:bg-orange-950/50 dark:border-orange-500/30">
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                        Mode Impersonasi Aktif
                    </span>
                    <span className="hidden sm:inline text-orange-700 dark:text-orange-300">
                        •
                    </span>
                    <span className="text-orange-700 dark:text-orange-300">
                        Anda login sebagai{' '}
                        <span className="font-semibold text-orange-900 dark:text-orange-100">
                            {impersonate.target_user?.name}
                        </span>
                    </span>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleStopImpersonating}
                className="h-8 shrink-0 border-orange-600 text-orange-700 hover:bg-orange-100 hover:text-orange-800 dark:border-orange-400 dark:text-orange-300 dark:hover:bg-orange-900 dark:hover:text-orange-100"
            >
                <X className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Stop Impersonating</span>
                <span className="sm:hidden">Stop</span>
            </Button>
        </div>
    );
}
