import { Column, DataTable } from '@/components/enhanced/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permintaan ATK',
        href: '/atk-requests',
    },
];

interface RequestDetail {
    id: string;
    item_id: string;
    item?: {
        id: string;
        nama_barang: string;
        stok: number;
    };
    jumlah_diminta: number;
    jumlah_disetujui: number | null;
    jumlah_diberikan: number | null;
}

interface AtkRequest {
    id: string;
    no_permintaan: string;
    user_id: string;
    department_id: string;
    tanggal: string;
    status: string;
    level1_approval_at: string | null;
    level2_approval_at: string | null;
    level3_approval_at: string | null;
    distributed_at: string | null;
    received_at: string | null;
    keterangan: string | null;
    alasan_penolakan: string | null;
    user?: {
        id: string;
        name: string;
    };
    department?: {
        id: string;
        name: string;
    };
    request_details?: RequestDetail[];
}

interface IndexProps {
    requests: {
        data: AtkRequest[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
        department_id?: string;
        search?: string;
    };
    can: {
        approve_level1: boolean;
        approve_level2: boolean;
        approve_level3: boolean;
    };
}

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
        label: 'Pending',
        className:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-800',
    },
    level1_approved: {
        label: 'Approved L1',
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-800',
    },
    level2_approved: {
        label: 'Approved L2',
        className:
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-800',
    },
    level3_approved: {
        label: 'Approved L3',
        className:
            'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-800',
    },
    rejected: {
        label: 'Rejected',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-800',
    },
    diserahkan: {
        label: 'Diserahkan',
        className:
            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-800',
    },
    diterima: {
        label: 'Diterima',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-800',
    },
};

export default function AtkRequestsIndex({
    requests,
    filters,
    can,
}: IndexProps) {
    const columns: Column<AtkRequest>[] = [
        {
            id: 'no_permintaan',
            header: 'No Request',
            accessor: 'no_permintaan',
            sortable: true,
        },
        {
            id: 'requester',
            header: 'Pemohon',
            accessor: (row) => row.user?.name || '-',
            sortable: false,
        },
        {
            id: 'department',
            header: 'Departemen',
            accessor: (row) => row.department?.name || '-',
            sortable: false,
        },
        {
            id: 'total_items',
            header: 'Total Item',
            accessor: (row) => row.request_details?.length || 0,
            sortable: false,
            className: 'text-center',
        },
        {
            id: 'status',
            header: 'Status',
            accessor: (row) => {
                const config = statusConfig[row.status] || {
                    label: row.status,
                    className: 'bg-gray-100 text-gray-800',
                };
                return (
                    <Badge className={config.className}>{config.label}</Badge>
                );
            },
            sortable: true,
        },
        {
            id: 'tanggal',
            header: 'Tanggal',
            accessor: (row) =>
                new Date(row.tanggal).toLocaleDateString('id-ID'),
            sortable: true,
        },
        {
            id: 'actions',
            header: 'Aksi',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <Link href={route('atk-requests.show', row.id)}>
                        <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            ),
            sortable: false,
            className: 'text-center',
        },
    ];

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route('atk-requests.index'),
            {
                ...filters,
                [key]: value,
            },
            {
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permintaan ATK" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Permintaan ATK</h1>
                        <p className="text-muted-foreground">
                            Kelola permintaan ATK dengan workflow approval
                        </p>
                    </div>
                    <Link href={route('atk-requests.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Permintaan
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama pemohon atau no request..."
                            className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            value={filters.search || ''}
                            onChange={(e) =>
                                handleFilterChange('search', e.target.value)
                            }
                        />
                    </div>

                    <select
                        className="rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        value={filters.status || ''}
                        onChange={(e) =>
                            handleFilterChange('status', e.target.value)
                        }
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="level1_approved">Approved L1</option>
                        <option value="level2_approved">Approved L2</option>
                        <option value="level3_approved">Approved L3</option>
                        <option value="rejected">Rejected</option>
                        <option value="diserahkan">Diserahkan</option>
                        <option value="diterima">Diterima</option>
                    </select>

                    {(can.approve_level1 ||
                        can.approve_level2 ||
                        can.approve_level3) && (
                        <select
                            className="rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            value={filters.department_id || ''}
                            onChange={(e) =>
                                handleFilterChange(
                                    'department_id',
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">Semua Departemen</option>
                            {/* Add department options if needed */}
                        </select>
                    )}
                </div>

                {/* Data Table */}
                <DataTable
                    data={requests.data}
                    columns={columns}
                    pagination={true}
                    pageSize={requests.per_page}
                    emptyMessage="Tidak ada permintaan ATK"
                />

                {/* Summary */}
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Total {requests.total} permintaan ATK
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
