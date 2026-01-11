import {
    destroy,
    index,
    update,
} from '@/actions/App/Http/Controllers/OfficeSupplyController';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    MoreHorizontal,
    Package,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bahan Keperluan Kantor',
        href: index().url,
    },
];

interface Supply {
    id: string;
    nama_barang: string;
    satuan: string;
    kategori: 'Consumables' | 'Cleaning Supplies' | 'Operational';
    stok: number;
    stok_minimal: number;
    deskripsi?: string | null;
}

interface IndexProps {
    supplies: {
        data: Supply[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
        kategori: string;
    };
}

export default function OfficeSuppliesIndex({ supplies, filters }: IndexProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        supply: Supply | null;
    }>({
        open: false,
        supply: null,
    });
    const [editDialog, setEditDialog] = useState<{
        open: boolean;
        supply: Supply | null;
    }>({
        open: false,
        supply: null,
    });

    const deleteForm = useForm({});
    const editForm = useForm({
        nama_barang: '',
        satuan: '',
        kategori: '',
        deskripsi: '',
        stok: 0,
        stok_minimal: 0,
    });

    const handleSearch = (search: string) => {
        router.get(
            index().url,
            { ...filters, search },
            { preserveState: true },
        );
    };

    const handleCategoryFilter = (kategori: string) => {
        router.get(
            index().url,
            { ...filters, kategori },
            { preserveState: true },
        );
    };

    const handleDelete = () => {
        if (!deleteDialog.supply) return;

        deleteForm.delete(destroy({ office_supply: deleteDialog.supply.id }), {
            onSuccess: () => {
                setDeleteDialog({ open: false, supply: null });
            },
        });
    };

    const handleEdit = () => {
        if (!editDialog.supply) return;

        editForm.put(update({ office_supply: editDialog.supply.id }), {
            onSuccess: () => {
                setEditDialog({ open: false, supply: null });
                editForm.reset();
            },
        });
    };

    const openEditDialog = (supply: Supply) => {
        editForm.setData({
            nama_barang: supply.nama_barang,
            satuan: supply.satuan,
            kategori: supply.kategori,
            deskripsi: supply.deskripsi || '',
            stok: supply.stok,
            stok_minimal: supply.stok_minimal,
        });
        setEditDialog({ open: true, supply });
    };

    const isLowStock = (supply: Supply) => supply.stok <= supply.stok_minimal;

    const columns: Column<Supply>[] = [
        {
            id: 'nama_barang',
            header: 'Nama Barang',
            accessor: 'nama_barang',
            sortable: true,
            cell: (supply) => (
                <div className="flex items-center gap-2">
                    <Package className="size-4 text-muted-foreground" />
                    <span className="font-medium">{supply.nama_barang}</span>
                    {isLowStock(supply) && (
                        <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="size-3" />
                            Stok Rendah
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            id: 'kategori',
            header: 'Kategori',
            accessor: 'kategori',
            sortable: true,
            cell: (supply) => (
                <Badge
                    variant={
                        supply.kategori === 'Consumables'
                            ? 'default'
                            : 'secondary'
                    }
                >
                    {supply.kategori}
                </Badge>
            ),
        },
        {
            id: 'stok',
            header: 'Stok',
            accessor: 'stok',
            sortable: true,
            cell: (supply) => (
                <span
                    className={
                        isLowStock(supply)
                            ? 'font-semibold text-destructive'
                            : ''
                    }
                >
                    {supply.stok} {supply.satuan}
                </span>
            ),
        },
        {
            id: 'stok_minimal',
            header: 'Stok Minimal',
            accessor: 'stok_minimal',
            sortable: true,
            cell: (supply) => `${supply.stok_minimal} ${supply.satuan}`,
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: (supply) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => openEditDialog(supply)}
                        >
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                setDeleteDialog({ open: true, supply })
                            }
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 size-4" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bahan Keperluan Kantor" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Bahan Keperluan Kantor
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola bahan keperluan kantor
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={index().url}>
                            <Plus className="mr-2 size-4" />
                            Tambah Baru
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Item
                                </p>
                                <p className="text-2xl font-bold">
                                    {supplies.total}
                                </p>
                            </div>
                            <Package className="size-8 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Stok Rendah
                                </p>
                                <p className="text-2xl font-bold text-destructive">
                                    {
                                        supplies.data.filter((s) =>
                                            isLowStock(s),
                                        ).length
                                    }
                                </p>
                            </div>
                            <AlertTriangle className="size-8 text-destructive" />
                        </div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Kategori
                                </p>
                                <p className="text-2xl font-bold">3</p>
                            </div>
                            <Package className="size-8 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Input
                        placeholder="Cari nama barang..."
                        defaultValue={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select
                        name="kategori"
                        value={filters.kategori}
                        onValueChange={handleCategoryFilter}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Semua Kategori</SelectItem>
                            <SelectItem value="Consumables">
                                Consumables
                            </SelectItem>
                            <SelectItem value="Cleaning Supplies">
                                Cleaning Supplies
                            </SelectItem>
                            <SelectItem value="Operational">
                                Operational
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <DataTable
                    data={supplies.data}
                    columns={columns}
                    searchable={false}
                    pagination={false}
                    emptyMessage="Tidak ada bahan kantor"
                />

                {/* Pagination */}
                {supplies.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Halaman {supplies.current_page} dari{' '}
                            {supplies.last_page}
                        </p>
                        <div className="flex gap-2">
                            {Array.from({ length: supplies.last_page }).map(
                                (_, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            supplies.current_page === i + 1
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            router.get(index().url, {
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

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({ open, supply: null })
                    }
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Bahan Kantor</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus &quot;
                                {deleteDialog.supply?.nama_barang}&quot;?
                                Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setDeleteDialog({
                                        open: false,
                                        supply: null,
                                    })
                                }
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={deleteForm.processing}
                                variant="destructive"
                            >
                                {deleteForm.processing
                                    ? 'Menghapus...'
                                    : 'Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog
                    open={editDialog.open}
                    onOpenChange={(open) =>
                        setEditDialog({ open, supply: null })
                    }
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Bahan Kantor</DialogTitle>
                            <DialogDescription>
                                Edit informasi bahan kantor &quot;
                                {editDialog.supply?.nama_barang}&quot;
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleEdit();
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Nama Barang
                                </label>
                                <Input
                                    value={editForm.data.nama_barang}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'nama_barang',
                                            e.target.value,
                                        )
                                    }
                                />
                                {editForm.errors.nama_barang && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.nama_barang}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Satuan
                                </label>
                                <Input
                                    value={editForm.data.satuan}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'satuan',
                                            e.target.value,
                                        )
                                    }
                                />
                                {editForm.errors.satuan && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.satuan}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Kategori
                                </label>
                                <Select
                                    name="kategori"
                                    value={editForm.data.kategori}
                                    onValueChange={(value) =>
                                        editForm.setData('kategori', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Consumables">
                                            Consumables
                                        </SelectItem>
                                        <SelectItem value="Cleaning Supplies">
                                            Cleaning Supplies
                                        </SelectItem>
                                        <SelectItem value="Operational">
                                            Operational
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Stok
                                    </label>
                                    <Input
                                        type="number"
                                        value={editForm.data.stok}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'stok',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    {editForm.errors.stok && (
                                        <p className="text-sm text-destructive">
                                            {editForm.errors.stok}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Stok Minimal
                                    </label>
                                    <Input
                                        type="number"
                                        value={editForm.data.stok_minimal}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'stok_minimal',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    {editForm.errors.stok_minimal && (
                                        <p className="text-sm text-destructive">
                                            {editForm.errors.stok_minimal}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setEditDialog({
                                            open: false,
                                            supply: null,
                                        })
                                    }
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                >
                                    {editForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
