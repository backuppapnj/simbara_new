import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 md:p-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
                                <AppLogoIcon className="size-8 fill-current text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/60 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
                        <div className="p-6">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
