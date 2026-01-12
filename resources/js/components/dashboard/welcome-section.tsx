import { usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { type SharedData } from '@/types';

export default function WelcomeSection() {
    const { props } = usePage<SharedData>();
    const user = props.auth?.user as { name: string } | undefined;

    const getCurrentDate = () => {
        return format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });
    };

    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
                Selamat datang, {user?.name ?? 'User'}!
            </h1>
            <p className="text-muted-foreground">{getCurrentDate()}</p>
        </div>
    );
}
