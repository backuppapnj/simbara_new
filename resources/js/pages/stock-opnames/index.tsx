import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import {
    FileText,
    Plus,
    Eye,
    Check,
    FileCheck,
    Download,
    Filter,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Stock Opname',
        href: '/stock-opnames',
    },
];

interface StockOpnameDetail {
    id: string;
    item_id: string;
    item?: {
        id: string;
        kode_barang: string;
        nama_barang: string;
        satuan: string;
    };
    stok_sistem: number;
    stok_fisik: number;
    selisih: number;
    keterangan: string | null;
}

interface StockOpname {
    id: string;
    no_so: string;
    tanggal: string;
    periode_bulan: string;
    periode_tahun: number;
    status: 'draft' | 'completed' | 'approved';
    keterangan: string | null;
    created_at: string;
    stock_opname_details: StockOpnameDetail[];
    approver?: {
        id: string;
        name: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: StockOpname[];
    current_page: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: PaginationLink[];
}

interface IndexProps {
    stockOpnames: PaginatedData;
    filters: {
        status?: string;
        periode_bulan?: string;
        periode_tahun?: string;
    };
}

const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const statusLabels = {
    draft: 'Draft',
    completed: 'Selesai',
    approved: 'Disetujui',
};

export default function Index({ stockOpnames, filters }: IndexProps) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route('stock-opnames.index'),
            { ...filters, [key]: value },
            { preserveState: true }
        );
    };

    const handleStatusChange = (stockOpname: StockOpname, action: 'submit' | 'approve') => {
        if (!confirm(`Apakah Anda yakin ingin ${action === 'submit' ? 'mensubmit' : 'mengapprove'} stock opname ini?`)) {
            return;
        }

        router.post(
            route(`stock-opnames.${action}`, stockOpname),
            {},
            {
                onSuccess: () => {
                    alert(`Stock opname berhasil ${action === 'submit' ? 'disubmit' : 'diapprove'}`);
                },
            }
        );
    };

    const handleDownloadBa = (stockOpname: StockOpname) => {
        window.location.href = route('stock-opnames.ba-pdf', stockOpname);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Opname" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Stock Opname</h1>
                        <p className="text-muted-foreground">
                            Kelola stock opname dan berita acara
                        </p>
                    </div>
                    <Link
                        href={route('stock-opnames.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Buat Stock Opname
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="status" className="text-xs text-muted-foreground">
                            Status
                        </label>
                        <select
                            id="status"
                            value={filters.status ?? ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="rounded-md border bg-background px-3 py-1.5 text-sm"
                        >
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="completed">Selesai</option>
                            <option value="approved">Disetujui</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="bulan" className="text-xs text-muted-foreground">
                            Bulan
                        </label>
                        <select
                            id="bulan"
                            value={filters.periode_bulan ?? ''}
                            onChange={(e) => handleFilterChange('periode_bulan', e.target.value)}
                            className="rounded-md border bg-background px-3 py-1.5 text-sm"
                        >
                            <option value="">Semua Bulan</option>
                            <option value="Januari">Januari</option>
                            <option value="Februari">Februari</option>
                            <option value="Maret">Maret</option>
                            <option value="April">April</option>
                            <option value="Mei">Mei</option>
                            <option value="Juni">Juni</option>
                            <option value="Juli">Juli</option>
                            <option value="Agustus">Agustus</option>
                            <option value="September">September</option>
                            <option value="Oktober">Oktober</option>
                            <option value="November">November</option>
                            <option value="Desember">Desember</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="tahun" className="text-xs text-muted-foreground">
                            Tahun
                        </label>
                        <input
                            id="tahun"
                            type="number"
                            value={filters.periode_tahun ?? ''}
                            onChange={(e) => handleFilterChange('periode_tahun', e.target.value)}
                            placeholder="2024"
                            className="w-24 rounded-md border bg-background px-3 py-1.5 text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">No. SO</th>
                                    <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                                    <th className="px-4 py-3 text-left font-medium">Periode</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-center font-medium">Jumlah Item</th>
                                    <th className="px-4 py-3 text-center font-medium">Selisih</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockOpnames.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            <FileText className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>Belum ada data stock opname</p>
                                        </td>
                                    </tr>
                                ) : (
                                    stockOpnames.data.map((so) => {
                                        const totalSelisih = so.stock_opname_details.reduce(
                                            (sum, detail) => sum + detail.selisih,
                                            0
                                        );

                                        return (
                                            <tr key={so.id} className="border-b hover:bg-muted/50">
                                                <td className="px-4 py-3 font-medium">{so.no_so}</td>
                                                <td className="px-4 py-3">
                                                    {new Date(so.tanggal).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {so.periode_bulan} {so.periode_tahun}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            statusColors[so.status]
                                                        }`}
                                                    >
                                                        {statusLabels[so.status]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {so.stock_opname_details.length}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={
                                                            totalSelisih > 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : totalSelisih < 0
                                                                  ? 'text-red-600 dark:text-red-400'
                                                                  : ''
                                                        }
                                                    >
                                                        {totalSelisih > 0 && '+'}
                                                        {totalSelisih}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('stock-opnames.show', so)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Link>

                                                        {so.status === 'draft' && (
                                                            <button
                                                                onClick={() => handleStatusChange(so, 'submit')}
                                                                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                                                title="Submit"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </button>
                                                        )}

                                                        {so.status === 'completed' && (
                                                            <button
                                                                onClick={() => handleStatusChange(so, 'approve')}
                                                                className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                                                title="Approve"
                                                            >
                                                                <FileCheck className="h-3 w-3" />
                                                            </button>
                                                        )}

                                                        {so.status === 'approved' && (
                                                            <button
                                                                onClick={() => handleDownloadBa(so)}
                                                                className="inline-flex items-center gap-1 rounded-md bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                                                                title="Download Berita Acara"
                                                            >
                                                                <Download className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {stockOpnames.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <div className="text-sm text-muted-foreground">
                                Halaman {stockOpnames.current_page} dari {stockOpnames.last_page_url?.split('=').pop()}
                            </div>
                            <div className="flex gap-2">
                                {stockOpnames.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className={`rounded-md px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted hover:bg-muted/70'
                                        } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
