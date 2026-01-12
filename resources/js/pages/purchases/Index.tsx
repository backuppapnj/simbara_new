import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import purchasesRoutes from '@/routes/purchases';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Eye,
    FileText,
    Filter,
    PackageCheck,
    Plus,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pembelian ATK',
        href: '/purchases',
    },
];

interface PurchaseDetail {
    id: string;
    item_id: string;
    item?: {
        id: string;
        kode_barang: string;
        nama_barang: string;
        satuan: string;
    };
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
}

interface Purchase {
    id: string;
    no_pembelian: string;
    tanggal: string;
    supplier: string;
    total_nilai: number;
    status: 'draft' | 'received' | 'completed';
    keterangan: string | null;
    created_at: string;
    purchase_details: PurchaseDetail[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Purchase[];
    current_page: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: PaginationLink[];
    total: number;
}

interface IndexProps {
    purchases: PaginatedData;
    filters: {
        status?: string;
        supplier?: string;
        search?: string;
    };
}

const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    received: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const statusLabels = {
    draft: 'Draft',
    received: 'Diterima',
    completed: 'Selesai',
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function PurchasesIndex({ purchases, filters }: IndexProps) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            purchasesRoutes.index.url(),
            { ...filters, [key]: value },
            { preserveState: true },
        );
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;
        handleFilterChange('search', search);
    };

    const handleReceive = (purchase: Purchase) => {
        if (
            !confirm(
                `Apakah Anda yakin ingin menerima barang dari pembelian ${purchase.no_pembelian}?`,
            )
        ) {
            return;
        }

        router.visit(purchasesRoutes.show.url(purchase), {
            method: 'get',
        });
    };

    const handleComplete = (purchase: Purchase) => {
        if (
            !confirm(
                `Apakah Anda yakin ingin menyelesaikan pembelian ${purchase.no_pembelian} dan mengupdate stok?`,
            )
        ) {
            return;
        }

        router.post(
            purchasesRoutes.complete.url(purchase),
            {},
            {
                onSuccess: () => {
                    alert(
                        'Pembelian berhasil diselesaikan dan stok telah diupdate.',
                    );
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembelian ATK" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Pembelian ATK
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola pembelian ATK dan penerimaan barang
                        </p>
                    </div>
                    <Link
                        href={purchasesRoutes.create.url()}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Buat Pembelian
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="status"
                            className="text-xs text-muted-foreground"
                        >
                            Status
                        </label>
                        <select
                            id="status"
                            value={filters.status ?? ''}
                            onChange={(e) =>
                                handleFilterChange('status', e.target.value)
                            }
                            className="rounded-md border bg-background px-3 py-1.5 text-sm"
                        >
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="received">Diterima</option>
                            <option value="completed">Selesai</option>
                        </select>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-1"
                    >
                        <label
                            htmlFor="search"
                            className="text-xs text-muted-foreground"
                        >
                            Cari Supplier
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="search"
                                name="search"
                                type="text"
                                defaultValue={filters.search ?? ''}
                                placeholder="Nama supplier..."
                                className="w-64 rounded-md border bg-background px-3 py-1.5 text-sm"
                            />
                            <button
                                type="submit"
                                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                            >
                                Cari
                            </button>
                        </div>
                    </form>

                    {(filters.status || filters.search || filters.supplier) && (
                        <div className="flex items-end">
                            <button
                                onClick={() =>
                                    router.get(purchasesRoutes.index.url())
                                }
                                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        No. Pembelian
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Supplier
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium">
                                        Total Item
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Total Nilai
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            <FileText className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>Belum ada data pembelian</p>
                                        </td>
                                    </tr>
                                ) : (
                                    purchases.data.map((purchase) => (
                                        <tr
                                            key={purchase.id}
                                            className="border-b hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {purchase.no_pembelian}
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(
                                                    purchase.tanggal,
                                                ).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                {purchase.supplier}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {
                                                    purchase.purchase_details
                                                        .length
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatCurrency(
                                                    purchase.total_nilai,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        statusColors[
                                                            purchase.status
                                                        ]
                                                    }`}
                                                >
                                                    {
                                                        statusLabels[
                                                            purchase.status
                                                        ]
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={purchasesRoutes.show.url(
                                                            purchase,
                                                        )}
                                                        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Link>

                                                    {purchase.status ===
                                                        'draft' && (
                                                        <button
                                                            onClick={() =>
                                                                handleReceive(
                                                                    purchase,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                                            title="Terima Barang"
                                                        >
                                                            <PackageCheck className="h-3 w-3" />
                                                        </button>
                                                    )}

                                                    {purchase.status ===
                                                        'received' && (
                                                        <button
                                                            onClick={() =>
                                                                handleComplete(
                                                                    purchase,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                                            title="Selesaikan & Update Stok"
                                                        >
                                                            <CheckCircle className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {purchases.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {purchases.data.length} dari{' '}
                                {purchases.total} data
                            </div>
                            <div className="flex gap-2">
                                {purchases.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        disabled={!link.url}
                                        className={`rounded-md px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted hover:bg-muted/70'
                                        } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
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
