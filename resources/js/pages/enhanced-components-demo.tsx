import { DataTable, QuickActions, StatCard } from '@/components/enhanced';
import AppLayout from '@/layouts/app-layout';
import {
    AlertTriangle,
    Download,
    FileText,
    Package,
    Plus,
    Settings,
    TrendingUp,
    Upload,
    Users,
} from 'lucide-react';
import { useState } from 'react';

// Mock data for DataTable
interface MockData {
    id: string;
    name: string;
    category: string;
    quantity: number;
    status: string;
    lastUpdated: string;
}

const mockData: MockData[] = [
    {
        id: '1',
        name: 'Laptop Dell Latitude 5420',
        category: 'Elektronik',
        quantity: 15,
        status: 'Tersedia',
        lastUpdated: '2024-01-10',
    },
    {
        id: '2',
        name: 'Kursi Kantor Ergonomis',
        category: 'Furniture',
        quantity: 42,
        status: 'Tersedia',
        lastUpdated: '2024-01-09',
    },
    {
        id: '3',
        name: 'Kertas A4 (Rim)',
        category: 'ATK',
        quantity: 150,
        status: 'Stok Menipis',
        lastUpdated: '2024-01-08',
    },
    {
        id: '4',
        name: 'Tinta Printer Epson L3110',
        category: 'ATK',
        quantity: 8,
        status: 'Kritis',
        lastUpdated: '2024-01-07',
    },
    {
        id: '5',
        name: 'Meja Kerja Direktur',
        category: 'Furniture',
        quantity: 5,
        status: 'Tersedia',
        lastUpdated: '2024-01-06',
    },
    {
        id: '6',
        name: 'Proyektor Epson EB-X450',
        category: 'Elektronik',
        quantity: 3,
        status: 'Tersedia',
        lastUpdated: '2024-01-05',
    },
    {
        id: '7',
        name: 'Pulpen Standard Box',
        category: 'ATK',
        quantity: 200,
        status: 'Tersedia',
        lastUpdated: '2024-01-04',
    },
    {
        id: '8',
        name: 'Lemari Arsip Besi',
        category: 'Furniture',
        quantity: 12,
        status: 'Tersedia',
        lastUpdated: '2024-01-03',
    },
];

// Mock columns for DataTable
const columns = [
    {
        id: 'name',
        header: 'Nama Barang',
        accessor: 'name' as const,
        sortable: true,
        filterable: true,
    },
    {
        id: 'category',
        header: 'Kategori',
        accessor: 'category' as const,
        sortable: true,
    },
    {
        id: 'quantity',
        header: 'Jumlah',
        accessor: 'quantity' as const,
        sortable: true,
    },
    {
        id: 'status',
        header: 'Status',
        accessor: 'status' as const,
        sortable: true,
        cell: (row: MockData) => {
            const statusColors: Record<string, string> = {
                Tersedia:
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                'Stok Menipis':
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                Kritis: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            };
            return (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-800'}`}
                >
                    {row.status}
                </span>
            );
        },
    },
    {
        id: 'lastUpdated',
        header: 'Terakhir Diupdate',
        accessor: 'lastUpdated' as const,
        sortable: true,
    },
];

// Mock quick actions
const quickActions = [
    {
        id: 'add-asset',
        label: 'Tambah Aset',
        icon: Plus,
        description: 'Tambah aset baru ke inventory',
        variant: 'primary' as const,
        href: '#',
    },
    {
        id: 'request-item',
        label: 'Permintaan Barang',
        icon: FileText,
        description: 'Buat permintaan barang',
        variant: 'default' as const,
        href: '#',
        badge: 'Baru',
    },
    {
        id: 'stock-opname',
        label: 'Stock Opname',
        icon: TrendingUp,
        description: 'Lakukan stock opname',
        variant: 'success' as const,
        href: '#',
    },
    {
        id: 'reports',
        label: 'Laporan',
        icon: Download,
        description: 'Unduh laporan inventory',
        variant: 'default' as const,
        href: '#',
    },
    {
        id: 'import-data',
        label: 'Import Data',
        icon: Upload,
        description: 'Import data dari Excel/CSV',
        variant: 'default' as const,
        href: '#',
    },
    {
        id: 'manage-users',
        label: 'Kelola User',
        icon: Users,
        description: 'Manajemen user dan permissions',
        variant: 'default' as const,
        href: '#',
    },
    {
        id: 'alerts',
        label: 'Notifikasi',
        icon: AlertTriangle,
        description: 'Lihat notifikasi dan alerts',
        variant: 'warning' as const,
        href: '#',
        badge: 3,
    },
    {
        id: 'settings',
        label: 'Pengaturan',
        icon: Settings,
        description: 'Konfigurasi sistem',
        variant: 'default' as const,
        href: '#',
    },
];

export default function EnhancedComponentsDemo() {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = () => {
        alert('Export functionality would be implemented here');
    };

    const handleRowClick = (row: MockData) => {
        alert(`Clicked on row: ${row.name}`);
    };

    return (
        <AppLayout title="Enhanced Components Demo">
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Enhanced UI Components
                    </h1>
                    <p className="text-muted-foreground">
                        Demonstrasi komponen enhanced dengan fitur lengkap
                    </p>
                </div>

                {/* StatCard Examples */}
                <div>
                    <h2 className="mb-4 text-2xl font-semibold">
                        StatCard Examples
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Aset"
                            value="1,234"
                            icon={Package}
                            trend={{ value: 12, label: 'dari bulan lalu' }}
                            status="success"
                            href="#"
                        />
                        <StatCard
                            title="Permintaan Pending"
                            value="23"
                            icon={FileText}
                            trend={{ value: -5, label: 'dari minggu lalu' }}
                            status="warning"
                            href="#"
                        />
                        <StatCard
                            title="Stok Kritis"
                            value="5"
                            icon={AlertTriangle}
                            trend={{ value: 2, label: 'dari kemarin' }}
                            status="error"
                            href="#"
                        />
                        <StatCard
                            title="Total User"
                            value="42"
                            icon={Users}
                            trend={{ value: 0, label: 'tetap' }}
                        />
                    </div>
                </div>

                {/* StatCard Loading and Error States */}
                <div>
                    <h2 className="mb-4 text-2xl font-semibold">
                        StatCard Loading & Error States
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Loading State"
                            value="0"
                            icon={Package}
                            isLoading
                        />
                        <StatCard
                            title="Error State"
                            value="0"
                            icon={AlertTriangle}
                            error="Gagal memuat data"
                        />
                        <StatCard
                            title="Normal State"
                            value="123"
                            icon={Package}
                            trend={{ value: 10 }}
                        />
                    </div>
                </div>

                {/* QuickActions Example */}
                <div>
                    <h2 className="mb-4 text-2xl font-semibold">
                        QuickActions Example
                    </h2>
                    <QuickActions
                        title="Aksi Cepat"
                        description="Aksi yang sering digunakan"
                        actions={quickActions.slice(0, 4)}
                        columns={4}
                    />
                </div>

                {/* QuickActions All */}
                <div>
                    <h2 className="mb-4 text-2xl font-semibold">
                        All QuickActions
                    </h2>
                    <QuickActions
                        title="Semua Aksi"
                        actions={quickActions}
                        columns={4}
                    />
                </div>

                {/* DataTable Example */}
                <div>
                    <h2 className="mb-4 text-2xl font-semibold">
                        DataTable Example
                    </h2>
                    <DataTable
                        data={mockData}
                        columns={columns}
                        isLoading={isLoading}
                        searchable
                        exportable
                        pagination
                        pageSize={5}
                        pageSizeOptions={[5, 10, 20]}
                        emptyMessage="Tidak ada data ditemukan"
                        onExport={handleExport}
                        onRowClick={handleRowClick}
                    />
                </div>

                {/* Toggle Loading Button */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsLoading(!isLoading)}
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        {isLoading ? 'Stop Loading' : 'Show Loading State'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
