import QuickActions from '@/components/dashboard/quick-actions';
import StatsChart from '@/components/dashboard/stats-chart';
import SummaryCard from '@/components/dashboard/summary-card';
import WelcomeSection from '@/components/dashboard/welcome-section';
import { WhenVisible } from '@inertiajs/react';
import {
    Archive,
    FileText,
    Package,
    ShoppingCart,
    Wrench,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface SummaryData {
    total_assets: number;
    total_atk: number;
    pending_requests: number;
    damaged_assets: number;
}

interface ChartData {
    asset_distribution: Array<{ category: string; count: number; value: number }>;
    monthly_trends: Array<{ month: string; requests: number; expenditure: number }>;
}

interface DashboardProps {
    user: {
        name: string;
        email?: string;
    };
    summary?: SummaryData;
    charts?: ChartData;
}

export default function Dashboard() {
    const { props } = usePage<DashboardProps>();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Welcome Section */}
                <WelcomeSection />

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        title="Total Aset"
                        value={props.summary?.total_assets ?? 0}
                        icon={Package}
                        isLoading={!props.summary}
                    />
                    <SummaryCard
                        title="Total ATK"
                        value={props.summary?.total_atk ?? 0}
                        icon={FileText}
                        isLoading={!props.summary}
                    />
                    <SummaryCard
                        title="Permintaan Pending"
                        value={props.summary?.pending_requests ?? 0}
                        icon={ShoppingCart}
                        isLoading={!props.summary}
                    />
                    <SummaryCard
                        title="Aset Rusak"
                        value={props.summary?.damaged_assets ?? 0}
                        icon={Wrench}
                        isLoading={!props.summary}
                    />
                </div>

                {/* Quick Actions */}
                <QuickActions />

                {/* Charts */}
                <WhenVisible
                    data="charts"
                    fallback={
                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
                            <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
                        </div>
                    }
                >
                    <div className="grid gap-4 lg:grid-cols-2">
                        <StatsChart
                            type="bar"
                            title="Distribusi Aset per Kategori"
                            data={props.charts?.asset_distribution ?? []}
                            dataKey="count"
                            xAxisKey="category"
                            isLoading={!props.charts}
                        />
                        <StatsChart
                            type="line"
                            title="Tren Permintaan Bulanan"
                            data={props.charts?.monthly_trends ?? []}
                            dataKey="requests"
                            xAxisKey="month"
                            isLoading={!props.charts}
                        />
                    </div>
                </WhenVisible>
            </div>
        </AppLayout>
    );
}
