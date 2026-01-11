import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';

interface BlankLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

/**
 * BlankLayout - A minimal layout without sidebar for pages that need full width
 *
 * This layout provides:
 * - Full-width content area without sidebar
 * - Optional header with breadcrumbs
 * - Clean, minimal design for focused pages
 *
 * Use cases:
 * - Print-friendly pages
 * - Landing pages
 * - Full-screen dashboards
 * - Custom layout pages
 */
export default function BlankLayout({
    children,
    breadcrumbs = [],
    title,
}: BlankLayoutProps) {
    return (
        <AppShell variant="blank">
            {title && (
                <div className="border-b border-sidebar-border/80 bg-background px-4 py-4 md:px-6">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                </div>
            )}
            {breadcrumbs.length > 0 && (
                <div className="border-b border-sidebar-border/70 bg-background px-4 py-2 md:px-6">
                    <div className="mx-auto flex w-full items-center justify-start text-sm text-muted-foreground">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <span key={index} className="flex items-center">
                                {index > 0 && (
                                    <span className="mx-2 text-muted-foreground/50">
                                        /
                                    </span>
                                )}
                                {breadcrumb.href ? (
                                    <a
                                        href={breadcrumb.href}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {breadcrumb.title}
                                    </a>
                                ) : (
                                    <span className="text-foreground">
                                        {breadcrumb.title}
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <AppContent variant="blank">{children}</AppContent>
        </AppShell>
    );
}
