'use client';

import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Home, Package, PenTool, Settings, ShoppingCart } from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: typeof Home;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Aset', href: '/assets', icon: Package },
    { label: 'ATK', href: '/atk', icon: PenTool },
    { label: 'Bahan Kantor', href: '/office-supplies', icon: ShoppingCart },
    { label: 'Settings', href: '/settings/profile', icon: Settings },
];

export function BottomNav() {
    const { url } = usePage();

    const isActive = (href: string) => {
        if (href === url) return true;
        // Handle nested routes
        if (href !== '/' && url.startsWith(href)) return true;
        return false;
    };

    return (
        <nav className="safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-background md:hidden">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 transition-colors',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            <span className="relative flex items-center justify-center">
                                <Icon
                                    className={cn(
                                        'size-5 transition-all',
                                        active && 'stroke-[2.5px]',
                                    )}
                                />
                                {active && (
                                    <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
                                )}
                            </span>
                            <span className="w-full truncate text-center text-[10px] leading-tight font-medium">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
