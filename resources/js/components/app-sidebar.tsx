import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavSection } from '@/components/nav-section';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import assets from '@/routes/assets/index';
import items from '@/routes/items/index';
import officeSupplies from '@/routes/office-supplies/index';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Box,
    Folder,
    LayoutGrid,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Aset',
        href: assets.index(),
        icon: Box,
    },
    {
        title: 'ATK',
        href: items.index(),
        icon: BookOpen,
    },
    {
        title: 'Bahan Kantor',
        href: officeSupplies.index(),
        icon: Folder,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

const adminNavItems: NavGroup = {
    title: 'Admin',
    items: [
        {
            title: 'Manajemen Role',
            href: '/admin/roles',
            icon: Shield,
        },
        {
            title: 'Notifikasi',
            href: '/admin/notification-logs',
            icon: Bell,
        },
        {
            title: 'Pengguna',
            href: '/admin/users',
            icon: Users,
        },
    ],
};

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    const isAdmin =
        auth?.user?.roles?.includes('super_admin') ||
        auth?.user?.roles?.includes('admin');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {isAdmin && <NavSection group={adminNavItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
