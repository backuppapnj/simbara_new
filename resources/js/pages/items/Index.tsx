import {
    destroy,
    index,
    store,
    update,
} from '@/actions/App/Http/Controllers/ItemController';
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
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Edit,
    Filter,
    Package,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Items',
        href: '/items',
    },
];

interface Item {
    id: string;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    kategori: string | null;
    stok: number;
    stok_minimal: number;
    stok_maksimal: number;
    harga_beli_terakhir: number | null;
    harga_rata_rata: number | null;
    harga_jual: number | null;
}

interface ItemsProps {
    items: {
        data: Item[];
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

const categories = [
    'Kertas',
    'Alat Tulis',
    'Perlengkapan Kantor',
    'Buku',
    'Map',
    'Lainnya',
];

export default function ItemsIndex({ items, filters }: ItemsProps) {
    const { props } = usePage();
    const auth = props.auth as {
        user: {
            permissions: string[];
        };
    };
    const permissions = auth?.user?.permissions || [];

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.kategori || '',
    );
    const [createDialog, setCreateDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    // Create form
    const createForm = useForm({
        kode_barang: '',
        nama_barang: '',
        satuan: '',
        kategori: '',
        stok: 0,
        stok_minimal: 0,
        stok_maksimal: 0,
        harga_beli_terakhir: '',
        harga_rata_rata: '',
        harga_jual: '',
    });

    // Edit form
    const editForm = useForm({
        kode_barang: '',
        nama_barang: '',
        satuan: '',
        kategori: '',
        stok: 0,
        stok_minimal: 0,
        stok_maksimal: 0,
        harga_beli_terakhir: '',
        harga_rata_rata: '',
        harga_jual: '',
    });

    const handleSearch = () => {
        router.get(index().url(), {
            search: search || undefined,
            kategori: selectedCategory || undefined,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setSelectedCategory('');
        router.get(index().url());
    };

    const openCreateDialog = () => {
        createForm.reset();
        setCreateDialog(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(store().url, {
            onSuccess: () => {
                setCreateDialog(false);
                createForm.reset();
            },
        });
    };

    const openEditDialog = (item: Item) => {
        setSelectedItem(item);
        editForm.setData({
            kode_barang: item.kode_barang,
            nama_barang: item.nama_barang,
            satuan: item.satuan,
            kategori: item.kategori || '',
            stok: item.stok,
            stok_minimal: item.stok_minimal,
            stok_maksimal: item.stok_maksimal,
            harga_beli_terakhir: item.harga_beli_terakhir?.toString() || '',
            harga_rata_rata: item.harga_rata_rata?.toString() || '',
            harga_jual: item.harga_jual?.toString() || '',
        });
        setEditDialog(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        editForm.put(update(selectedItem).url, {
            onSuccess: () => {
                setEditDialog(false);
                setSelectedItem(null);
                editForm.reset();
            },
        });
    };

    const openDeleteDialog = (item: Item) => {
        setSelectedItem(item);
        setDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedItem) return;

        editForm.delete(destroy(selectedItem).url, {
            onSuccess: () => {
                setDeleteDialog(false);
                setSelectedItem(null);
            },
        });
    };

    const formatCurrency = (value: number | null) => {
        if (!value) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(value);
    };

    const isBelowReorderPoint = (item: Item) => {
        return item.stok <= item.stok_minimal;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Data ATK" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Master Data ATK</h1>
                        <p className="text-muted-foreground">
                            Kelola daftar item Alat Tulis Kantor
                        </p>
                    </div>
                    {permissions.includes('atk.items.create') && (
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 size-4" />
                            Add Item
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Items
                                </p>
                                <p className="text-2xl font-bold">{items.total}</p>
                            </div>
                            <Package className="size-8 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Low Stock
                                </p>
                                <p className="text-2xl font-bold">
                                    {
                                        items.data.filter((item) =>
                                            isBelowReorderPoint(item),
                                        ).length
                                    }
                                </p>
                            </div>
                            <AlertCircle className="size-8 text-destructive" />
                        </div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Kategori
                                </p>
                                <p className="text-2xl font-bold">
                                    {
                                        new Set(
                                            items.data.map((i) => i.kategori),
                                        ).size
                                    }
                                </p>
                            </div>
                            <Filter className="size-8 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="search"
                                type="text"
                                placeholder="Cari nama atau kode barang..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger id="category" className="w-[200px]">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSearch}>
                            <Search className="mr-2 size-4" />
                            Search
                        </Button>
                        {(search || selectedCategory) && (
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                            >
                                <X className="mr-2 size-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode Barang</TableHead>
                                <TableHead>Nama Barang</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-right">Stok</TableHead>
                                <TableHead className="text-right">Satuan</TableHead>
                                <TableHead className="text-right">
                                    Harga Beli
                                </TableHead>
                                <TableHead className="text-right">
                                    Harga Jual
                                </TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-24 text-center"
                                    >
                                        No items found. Create a new item to get
                                        started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.kode_barang}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div>{item.nama_barang}</div>
                                                {isBelowReorderPoint(item) && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="mt-1"
                                                    >
                                                        Low Stock
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.kategori || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant={
                                                    isBelowReorderPoint(item)
                                                        ? 'destructive'
                                                        : 'outline'
                                                }
                                            >
                                                {item.stok}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.satuan}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                item.harga_beli_terakhir,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.harga_jual)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {permissions.includes(
                                                    'atk.items.edit',
                                                ) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditDialog(item)
                                                        }
                                                    >
                                                        <Edit className="size-4" />
                                                    </Button>
                                                )}
                                                {permissions.includes(
                                                    'atk.items.delete',
                                                ) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openDeleteDialog(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {items.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {items.current_page} of {items.last_page} •{' '}
                            {items.total} total items
                        </p>
                        <div className="flex gap-2">
                            {Array.from({ length: items.last_page }).map(
                                (_, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            items.current_page === i + 1
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            router.get(index().url(), {
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
            </div>

            {/* Create Dialog */}
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                        <DialogDescription>
                            Add a new ATK item to the inventory
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="kode_barang">
                                    Kode Barang *
                                </Label>
                                <Input
                                    id="kode_barang"
                                    value={createForm.data.kode_barang}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'kode_barang',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="ATK-0001"
                                />
                                {createForm.errors.kode_barang && (
                                    <p className="text-sm text-destructive">
                                        {createForm.errors.kode_barang}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="satuan">Satuan *</Label>
                                <Input
                                    id="satuan"
                                    value={createForm.data.satuan}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'satuan',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="pcs, rim, box"
                                />
                                {createForm.errors.satuan && (
                                    <p className="text-sm text-destructive">
                                        {createForm.errors.satuan}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nama_barang">
                                Nama Barang *
                            </Label>
                            <Input
                                id="nama_barang"
                                value={createForm.data.nama_barang}
                                onChange={(e) =>
                                    createForm.setData(
                                        'nama_barang',
                                        e.target.value,
                                    )
                                }
                                placeholder="Kertas A4"
                            />
                            {createForm.errors.nama_barang && (
                                <p className="text-sm text-destructive">
                                    {createForm.errors.nama_barang}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kategori">Kategori</Label>
                            <Select
                                value={createForm.data.kategori}
                                onValueChange={(value) =>
                                    createForm.setData('kategori', value)
                                }
                            >
                                <SelectTrigger id="kategori">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {createForm.errors.kategori && (
                                <p className="text-sm text-destructive">
                                    {createForm.errors.kategori}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="stok">Stok</Label>
                                <Input
                                    id="stok"
                                    type="number"
                                    min="0"
                                    value={createForm.data.stok}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'stok',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                />
                                {createForm.errors.stok && (
                                    <p className="text-sm text-destructive">
                                        {createForm.errors.stok}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stok_minimal">
                                    Stok Minimal
                                </Label>
                                <Input
                                    id="stok_minimal"
                                    type="number"
                                    min="0"
                                    value={createForm.data.stok_minimal}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'stok_minimal',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                />
                                {createForm.errors.stok_minimal && (
                                    <p className="text-sm text-destructive">
                                        {createForm.errors.stok_minimal}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stok_maksimal">
                                    Stok Maksimal
                                </Label>
                                <Input
                                    id="stok_maksimal"
                                    type="number"
                                    min="0"
                                    value={createForm.data.stok_maksimal}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'stok_maksimal',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                />
                                {createForm.errors.stok_maksimal && (
                                    <p className="text-sm text-destructive">
                                        {createForm.errors.stok_maksimal}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="harga_beli_terakhir">
                                    Harga Beli Terakhir
                                </Label>
                                <Input
                                    id="harga_beli_terakhir"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={createForm.data.harga_beli_terakhir}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'harga_beli_terakhir',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createForm.errors.harga_beli_terakhir && (
                                    <p className="text-sm text-destructive">
                                        {
                                            createForm.errors
                                                .harga_beli_terakhir
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="harga_rata_rata">
                                    Harga Rata-rata
                                </Label>
                                <Input
                                    id="harga_rata_rata"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={createForm.data.harga_rata_rata}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'harga_rata_rata',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createForm.errors.harga_rata_rata && (
                                    <p className="text-sm text-destructive">
                                        {createForm.errors.harga_rata_rata}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="harga_jual">
                                    Harga Jual
                                </Label>
                                <Input
                                    id="harga_jual"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={createForm.data.harga_jual}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'harga_jual',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createForm.errors.harga_jual && (
                                    <p className="text-sm text-destructive">
                                        {createForm.errors.harga_jual}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                {createForm.processing
                                    ? 'Creating...'
                                    : 'Create Item'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription>
                            Update item information
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit_kode_barang">
                                    Kode Barang *
                                </Label>
                                <Input
                                    id="edit_kode_barang"
                                    value={editForm.data.kode_barang}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'kode_barang',
                                            e.target.value,
                                        )
                                        }
                                />
                                {editForm.errors.kode_barang && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.kode_barang}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_satuan">Satuan *</Label>
                                <Input
                                    id="edit_satuan"
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_nama_barang">
                                Nama Barang *
                            </Label>
                            <Input
                                id="edit_nama_barang"
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
                            <Label htmlFor="edit_kategori">Kategori</Label>
                            <Select
                                value={editForm.data.kategori}
                                onValueChange={(value) =>
                                    editForm.setData('kategori', value)
                                }
                            >
                                <SelectTrigger id="edit_kategori">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editForm.errors.kategori && (
                                <p className="text-sm text-destructive">
                                    {editForm.errors.kategori}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit_stok">Stok</Label>
                                <Input
                                    id="edit_stok"
                                    type="number"
                                    min="0"
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
                                <Label htmlFor="edit_stok_minimal">
                                    Stok Minimal
                                </Label>
                                <Input
                                    id="edit_stok_minimal"
                                    type="number"
                                    min="0"
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
                            <div className="space-y-2">
                                <Label htmlFor="edit_stok_maksimal">
                                    Stok Maksimal
                                </Label>
                                <Input
                                    id="edit_stok_maksimal"
                                    type="number"
                                    min="0"
                                    value={editForm.data.stok_maksimal}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'stok_maksimal',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                />
                                {editForm.errors.stok_maksimal && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.stok_maksimal}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit_harga_beli_terakhir">
                                    Harga Beli Terakhir
                                </Label>
                                <Input
                                    id="edit_harga_beli_terakhir"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.harga_beli_terakhir}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'harga_beli_terakhir',
                                            e.target.value,
                                        )
                                    }
                                />
                                {editForm.errors.harga_beli_terakhir && (
                                    <p className="text-sm text-destructive">
                                        {
                                            editForm.errors
                                                .harga_beli_terakhir
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_harga_rata_rata">
                                    Harga Rata-rata
                                </Label>
                                <Input
                                    id="edit_harga_rata_rata"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.harga_rata_rata}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'harga_rata_rata',
                                            e.target.value,
                                        )
                                    }
                                />
                                {editForm.errors.harga_rata_rata && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.harga_rata_rata}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_harga_jual">
                                    Harga Jual
                                </Label>
                                <Input
                                    id="edit_harga_jual"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.harga_jual}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'harga_jual',
                                            e.target.value,
                                        )
                                    }
                                />
                                {editForm.errors.harga_jual && (
                                    <p className="text-sm text-destructive">
                                        {editForm.errors.harga_jual}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                {editForm.processing
                                    ? 'Updating...'
                                    : 'Update Item'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedItem?.nama_barang}
                            "? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={editForm.processing}
                        >
                            {editForm.processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
