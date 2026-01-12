import {
    index,
    quickDeduct,
    store,
} from '@/actions/App/Http/Controllers/OfficeUsageController';
import { DataTable, type Column } from '@/components/enhanced/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, MinusCircle, Package, Plus, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pemakaian Bahan Kantor',
        href: index.url(),
    },
];

interface Usage {
    id: string;
    jumlah: number;
    tanggal: string;
    keperluan: string | null;
    created_at: string;
    supply: {
        id: string;
        nama_barang: string;
        satuan: string;
    };
    user: {
        id: string;
        name: string;
    };
}

interface Supply {
    id: string;
    nama_barang: string;
    satuan: string;
    stok: number;
}

interface IndexProps {
    usages: {
        data: Usage[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    supplies: Supply[];
    filters: {
        date_from: string | null;
        date_to: string | null;
    };
}

export default function OfficeUsagesIndex({ usages, supplies, filters }: IndexProps) {
    const [usageDialog, setUsageDialog] = useState(false);
    const [quickDeductDialog, setQuickDeductDialog] = useState(false);

    const usageForm = useForm({
        supply_id: '',
        jumlah: '',
        tanggal: new Date().toISOString().split('T')[0],
        keperluan: '',
    });

    const quickDeductForm = useForm({
        supply_id: '',
        jumlah: '',
        keterangan: '',
    });

    const handleDateFilter = (
        field: 'date_from' | 'date_to',
        value: string,
    ) => {
        router.get(
            index.url(),
            { ...filters, [field]: value || null },
            { preserveState: true },
        );
    };

    const handleUsageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        usageForm.post(store.url(), {
            onSuccess: () => {
                setUsageDialog(false);
                usageForm.reset();
            },
        });
    };

    const handleQuickDeductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        quickDeductForm.post(quickDeduct.url(), {
            onSuccess: () => {
                setQuickDeductDialog(false);
                quickDeductForm.reset();
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const columns: Column<Usage>[] = [
        {
            id: 'tanggal',
            header: 'Tanggal',
            accessor: (usage) => usage.tanggal,
            sortable: true,
            cell: (usage) => (
                <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span>{formatDate(usage.tanggal)}</span>
                </div>
            ),
        },
        {
            id: 'supply',
            header: 'Item',
            accessor: (usage) => usage.supply.nama_barang,
            sortable: true,
            cell: (usage) => (
                <div className="flex items-center gap-2">
                    <Package className="size-4 text-muted-foreground" />
                    <div>
                        <div className="font-medium">
                            {usage.supply.nama_barang}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {usage.supply.satuan}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'jumlah',
            header: 'Jumlah',
            accessor: (usage) => usage.jumlah,
            sortable: true,
            cell: (usage) => (
                <Badge variant="outline">
                    {usage.jumlah} {usage.supply.satuan}
                </Badge>
            ),
        },
        {
            id: 'keperluan',
            header: 'Keperluan',
            accessor: (usage) => usage.keperluan,
            cell: (usage) => (
                <span className="text-sm">{usage.keperluan || '-'}</span>
            ),
        },
        {
            id: 'user',
            header: 'User',
            accessor: (usage) => usage.user.name,
            sortable: true,
            cell: (usage) => (
                <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span>{usage.user.name}</span>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemakaian Bahan Kantor" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Pemakaian Bahan Kantor
                        </h1>
                        <p className="text-muted-foreground">
                            Riwayat pemakaian bahan kantor
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setQuickDeductDialog(true)}
                            data-test="quick-deduct-button"
                        >
                            <MinusCircle className="mr-2 size-4" />
                            Quick Deduct
                        </Button>
                        <Button
                            onClick={() => setUsageDialog(true)}
                            data-test="log-usage-button"
                        >
                            <Plus className="mr-2 size-4" />
                            Catat Pemakaian
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Pemakaian
                                </p>
                                <p className="text-2xl font-bold">
                                    {usages.total}
                                </p>
                            </div>
                            <Package className="size-8 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Bulan Ini
                                </p>
                                <p className="text-2xl font-bold">
                                    {
                                        usages.data.filter(
                                            (u) =>
                                                new Date(
                                                    u.tanggal,
                                                ).getMonth() ===
                                                new Date().getMonth(),
                                        ).length
                                    }
                                </p>
                            </div>
                            <Calendar className="size-8 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                {/* Date Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="date_from">Dari:</Label>
                        <Input
                            id="date_from"
                            type="date"
                            value={filters.date_from || ''}
                            onChange={(e) =>
                                handleDateFilter('date_from', e.target.value)
                            }
                            className="w-[180px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="date_to">Sampai:</Label>
                        <Input
                            id="date_to"
                            type="date"
                            value={filters.date_to || ''}
                            onChange={(e) =>
                                handleDateFilter('date_to', e.target.value)
                            }
                            className="w-[180px]"
                        />
                    </div>
                    {(filters.date_from || filters.date_to) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                router.get(index.url(), {
                                    date_from: null,
                                    date_to: null,
                                })
                            }
                        >
                            Reset Filter
                        </Button>
                    )}
                </div>

                {/* Table */}
                <DataTable
                    data={usages.data}
                    columns={columns}
                    searchable={false}
                    pagination={false}
                    emptyMessage="Tidak ada data pemakaian"
                />

                {/* Pagination */}
                {usages.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Halaman {usages.current_page} dari{' '}
                            {usages.last_page}
                        </p>
                        <div className="flex gap-2">
                            {Array.from({ length: usages.last_page }).map(
                                (_, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            usages.current_page === i + 1
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            router.get(index.url(), {
                                                ...filters,
                                                page: i + 1,
                                            })
                                        }
                                    >
                                        {i + 1}
                                    </Button>
                                ),
                            )}
                        </div>
                    </div>
                )}

                {/* Usage Dialog */}
                <Dialog open={usageDialog} onOpenChange={setUsageDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                Catat Pemakaian Bahan Kantor
                            </DialogTitle>
                            <DialogDescription>
                                Catat pemakaian bahan kantor dengan lengkap
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={handleUsageSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="usage_supply_id">
                                    Bahan Kantor
                                </Label>
                                <Select
                                    name="supply_id"
                                    value={usageForm.data.supply_id}
                                    onValueChange={(value) =>
                                        usageForm.setData('supply_id', value)
                                    }
                                >
                                    <SelectTrigger id="usage_supply_id">
                                        <SelectValue placeholder="Pilih bahan kantor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supplies.map((supply) => (
                                            <SelectItem key={supply.id} value={supply.id}>
                                                {supply.nama_barang} (Stok: {supply.stok} {supply.satuan})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {usageForm.errors.supply_id && (
                                    <p className="text-sm text-destructive">
                                        {usageForm.errors.supply_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usage_jumlah">Jumlah</Label>
                                <Input
                                    id="usage_jumlah"
                                    type="number"
                                    min="1"
                                    value={usageForm.data.jumlah}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        usageForm.setData(
                                            'jumlah',
                                            e.target.value,
                                        )
                                    }
                                />
                                {usageForm.errors.jumlah && (
                                    <p className="text-sm text-destructive">
                                        {usageForm.errors.jumlah}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usage_tanggal">Tanggal</Label>
                                <Input
                                    id="usage_tanggal"
                                    type="date"
                                    value={usageForm.data.tanggal}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        usageForm.setData(
                                            'tanggal',
                                            e.target.value,
                                        )
                                    }
                                />
                                {usageForm.errors.tanggal && (
                                    <p className="text-sm text-destructive">
                                        {usageForm.errors.tanggal}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usage_keperluan">
                                    Keperluan
                                </Label>
                                <Textarea
                                    id="usage_keperluan"
                                    placeholder="Jelaskan keperluan pemakaian..."
                                    value={usageForm.data.keperluan}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        usageForm.setData(
                                            'keperluan',
                                            e.target.value,
                                        )
                                    }
                                />
                                {usageForm.errors.keperluan && (
                                    <p className="text-sm text-destructive">
                                        {usageForm.errors.keperluan}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setUsageDialog(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={usageForm.processing}
                                    data-test="usage-submit-button"
                                >
                                    {usageForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Quick Deduct Dialog */}
                <Dialog
                    open={quickDeductDialog}
                    onOpenChange={setQuickDeductDialog}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Quick Deduct Stok</DialogTitle>
                            <DialogDescription>
                                Kurangi stok dengan cepat tanpa mencatat
                                pemakaian lengkap
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={handleQuickDeductSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="qd_supply_id">
                                    Bahan Kantor
                                </Label>
                                <Select
                                    name="supply_id"
                                    value={quickDeductForm.data.supply_id}
                                    onValueChange={(value) =>
                                        quickDeductForm.setData(
                                            'supply_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger id="qd_supply_id">
                                        <SelectValue placeholder="Pilih bahan kantor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supplies.map((supply) => (
                                            <SelectItem key={supply.id} value={supply.id}>
                                                {supply.nama_barang} (Stok: {supply.stok} {supply.satuan})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {quickDeductForm.errors.supply_id && (
                                    <p className="text-sm text-destructive">
                                        {quickDeductForm.errors.supply_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qd_jumlah">Jumlah</Label>
                                <Input
                                    id="qd_jumlah"
                                    type="number"
                                    min="1"
                                    value={quickDeductForm.data.jumlah}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        quickDeductForm.setData(
                                            'jumlah',
                                            e.target.value,
                                        )
                                    }
                                />
                                {quickDeductForm.errors.jumlah && (
                                    <p className="text-sm text-destructive">
                                        {quickDeductForm.errors.jumlah}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qd_keterangan">
                                    Keterangan
                                </Label>
                                <Textarea
                                    id="qd_keterangan"
                                    placeholder="Keterangan singkat..."
                                    value={quickDeductForm.data.keterangan}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        quickDeductForm.setData(
                                            'keterangan',
                                            e.target.value,
                                        )
                                    }
                                />
                                {quickDeductForm.errors.keterangan && (
                                    <p className="text-sm text-destructive">
                                        {quickDeductForm.errors.keterangan}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setQuickDeductDialog(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={quickDeductForm.processing}
                                    data-test="quick-deduct-submit-button"
                                >
                                    {quickDeductForm.processing
                                        ? 'Memproses...'
                                        : 'Kurangi Stok'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
