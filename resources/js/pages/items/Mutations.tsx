import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePoll } from '@inertiajs/react';
import { ArrowLeft, Filter, RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Items',
        href: '/items',
    },
    {
        title: 'Mutations',
        href: '',
    },
];

interface StockMutation {
    id: string;
    jenis_mutasi: string;
    jumlah: number;
    stok_sebelum: number;
    stok_sesudah: number;
    running_balance?: number;
    keterangan: string | null;
    created_at: string;
}

interface Item {
    id: string;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    stok: number;
}

interface MutationsProps {
    item: Item;
    mutations: {
        data: StockMutation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        jenis: string;
        date_from: string;
        date_to: string;
    };
}

function getMutationBadgeVariant(
    jenis: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (jenis) {
        case 'masuk':
            return 'default';
        case 'keluar':
            return 'destructive';
        case 'adjustment':
            return 'secondary';
        default:
            return 'outline';
    }
}

function getMutationBadgeColor(jenis: string): string {
    switch (jenis) {
        case 'masuk':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'keluar':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'adjustment':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

export default function ItemMutations({
    item,
    mutations,
    filters,
}: MutationsProps) {
    // Enable Inertia v2 polling for real-time updates (every 5 seconds)
    const { start, stop } = usePoll(5000, {
        preserveState: true,
        preserveScroll: true,
    });

    const handleManualRefresh = () => {
        // Stop and restart polling to force immediate refresh
        stop();
        start();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kartu Stok - ${item.nama_barang}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/items">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Kartu Stok</h1>
                            <p className="text-muted-foreground">
                                {item.nama_barang} ({item.kode_barang})
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleManualRefresh}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Current Balance Card */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Saldo Saat Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">
                                {item.stok}
                            </span>
                            <span className="text-lg text-muted-foreground">
                                {item.satuan}
                            </span>
                        </div>
                        {item.stok <= 10 && (
                            <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                                Stok menipis! Pertimbangkan untuk melakukan
                                pembelian.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Jenis Mutasi
                                </label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    value={filters.jenis}
                                    onChange={(e) => {
                                        const url = new URL(
                                            window.location.href,
                                        );
                                        if (e.target.value) {
                                            url.searchParams.set(
                                                'jenis',
                                                e.target.value,
                                            );
                                        } else {
                                            url.searchParams.delete('jenis');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                >
                                    <option value="">Semua</option>
                                    <option value="masuk">Masuk</option>
                                    <option value="keluar">Keluar</option>
                                    <option value="adjustment">
                                        Adjustment
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Dari Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => {
                                        const url = new URL(
                                            window.location.href,
                                        );
                                        if (e.target.value) {
                                            url.searchParams.set(
                                                'date_from',
                                                e.target.value,
                                            );
                                        } else {
                                            url.searchParams.delete(
                                                'date_from',
                                            );
                                        }
                                        window.location.href = url.toString();
                                    }}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Sampai Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => {
                                        const url = new URL(
                                            window.location.href,
                                        );
                                        if (e.target.value) {
                                            url.searchParams.set(
                                                'date_to',
                                                e.target.value,
                                            );
                                        } else {
                                            url.searchParams.delete('date_to');
                                        }
                                        window.location.href = url.toString();
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mutations Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Mutasi</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {mutations.total} mutasi stock
                        </p>
                    </CardHeader>
                    <CardContent>
                        {mutations.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    Tidak ada mutasi stock ditemukan.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead className="text-right">
                                                Masuk
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Keluar
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Saldo
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mutations.data.map((mutation) => (
                                            <TableRow key={mutation.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {new Date(
                                                        mutation.created_at,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        },
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {mutation.keterangan || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getMutationBadgeColor(
                                                            mutation.jenis_mutasi,
                                                        )}
                                                    >
                                                        {mutation.jenis_mutasi ===
                                                            'masuk' && 'Masuk'}
                                                        {mutation.jenis_mutasi ===
                                                            'keluar' &&
                                                            'Keluar'}
                                                        {mutation.jenis_mutasi ===
                                                            'adjustment' &&
                                                            'Adjustment'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {mutation.jenis_mutasi ===
                                                        'masuk' ||
                                                    (mutation.jenis_mutasi ===
                                                        'adjustment' &&
                                                        mutation.jumlah > 0) ? (
                                                        <span className="font-medium text-green-600 dark:text-green-400">
                                                            +
                                                            {Math.abs(
                                                                mutation.jumlah,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {mutation.jenis_mutasi ===
                                                        'keluar' ||
                                                    (mutation.jenis_mutasi ===
                                                        'adjustment' &&
                                                        mutation.jumlah < 0) ? (
                                                        <span className="font-medium text-red-600 dark:text-red-400">
                                                            -
                                                            {Math.abs(
                                                                mutation.jumlah,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {mutation.running_balance ??
                                                        mutation.stok_sesudah}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {mutations.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Halaman {mutations.current_page} dari{' '}
                                    {mutations.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {mutations.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const url = new URL(
                                                    window.location.href,
                                                );
                                                url.searchParams.set(
                                                    'page',
                                                    String(
                                                        mutations.current_page -
                                                            1,
                                                    ),
                                                );
                                                window.location.href =
                                                    url.toString();
                                            }}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {mutations.current_page <
                                        mutations.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const url = new URL(
                                                    window.location.href,
                                                );
                                                url.searchParams.set(
                                                    'page',
                                                    String(
                                                        mutations.current_page +
                                                            1,
                                                    ),
                                                );
                                                window.location.href =
                                                    url.toString();
                                            }}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Real-time indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    <span>Auto-refresh setiap 5 detik</span>
                </div>
            </div>
        </AppLayout>
    );
}
