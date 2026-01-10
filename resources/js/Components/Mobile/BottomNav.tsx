'use client';

import { Home, Package, PenTool, ShoppingCart, Settings } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border safe-area-inset-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors relative group',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            <span className="relative flex items-center justify-center">
                                <Icon
                                    className={cn(
                                        'size-5 transition-all',
                                        active && 'stroke-[2.5px]'
                                    )}
                                />
                                {active && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
                                )}
                            </span>
                            <span className="text-[10px] font-medium leading-tight truncate w-full text-center">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
