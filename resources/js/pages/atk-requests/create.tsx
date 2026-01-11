import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Package, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Item {
    id: string;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    stok: number;
    kategori: string | null;
}

interface Department {
    id: string;
    name: string;
}

interface CreateProps {
    items: Item[];
    departments: Department[];
    user_department_id: string | null;
}

interface RequestItem {
    item_id: string;
    jumlah_diminta: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permintaan ATK',
        href: '/atk-requests',
    },
    {
        title: 'Buat Permintaan',
        href: '/atk-requests/create',
    },
];

export default function AtkRequestsCreate({
    items,
    departments,
    user_department_id,
}: CreateProps) {
    const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [stockWarning, setStockWarning] = useState<string>('');

    const form = useForm({
        department_id: user_department_id || '',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        items: [] as RequestItem[],
    });

    const selectedItem = items.find((item) => item.id === selectedItemId);

    const handleAddItem = () => {
        if (!selectedItemId || quantity <= 0) {
            return;
        }

        const item = items.find((i) => i.id === selectedItemId);
        if (!item) return;

        // Check if already added
        if (requestItems.some((ri) => ri.item_id === selectedItemId)) {
            setStockWarning(
                'Item sudah ditambahkan. Silakan hapus terlebih dahulu jika ingin mengubah jumlah.',
            );
            return;
        }

        // Check stock
        if (quantity > item.stok) {
            setStockWarning(
                `Stok tidak cukup! Tersedia: ${item.stok} ${item.satuan}`,
            );
            return;
        }

        setRequestItems([
            ...requestItems,
            {
                item_id: selectedItemId,
                jumlah_diminta: quantity,
            },
        ]);

        setSelectedItemId('');
        setQuantity(1);
        setStockWarning('');
    };

    const handleRemoveItem = (itemId: string) => {
        setRequestItems(requestItems.filter((ri) => ri.item_id !== itemId));
        setStockWarning('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (requestItems.length === 0) {
            setStockWarning('Mohon tambahkan minimal satu item.');
            return;
        }

        form.transform((data) => ({
            ...data,
            items: requestItems,
        })).post(route('atk-requests.store'));
    };

    const filteredItems = items.filter((item) => item.stok > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Permintaan ATK" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('atk-requests.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Buat Permintaan ATK
                        </h1>
                        <p className="text-muted-foreground">
                            Buat permintaan barang ATK dengan workflow approval
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Permintaan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="department_id">
                                        Departemen
                                    </Label>
                                    <Select
                                        value={form.data.department_id}
                                        onValueChange={(value) =>
                                            form.setData('department_id', value)
                                        }
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Pilih departemen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={dept.id}
                                                >
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.department_id && (
                                        <p className="text-sm text-red-600">
                                            {form.errors.department_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tanggal">Tanggal</Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        value={form.data.tanggal}
                                        onChange={(e) =>
                                            form.setData(
                                                'tanggal',
                                                e.target.value,
                                            )
                                        }
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                    />
                                    {form.errors.tanggal && (
                                        <p className="text-sm text-red-600">
                                            {form.errors.tanggal}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keterangan">
                                    Keterangan (Opsional)
                                </Label>
                                <Input
                                    id="keterangan"
                                    value={form.data.keterangan}
                                    onChange={(e) =>
                                        form.setData(
                                            'keterangan',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Tambahkan keterangan atau keperluan..."
                                />
                                {form.errors.keterangan && (
                                    <p className="text-sm text-red-600">
                                        {form.errors.keterangan}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Tambah Barang
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {stockWarning && (
                                <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-900/20">
                                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        {stockWarning}
                                    </p>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="item">Barang</Label>
                                    <Select
                                        value={selectedItemId}
                                        onValueChange={setSelectedItemId}
                                    >
                                        <SelectTrigger id="item">
                                            <SelectValue placeholder="Pilih barang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredItems.map((item) => (
                                                <SelectItem
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    <div className="flex w-full items-center justify-between gap-2">
                                                        <span>
                                                            {item.nama_barang}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Stok: {item.stok}{' '}
                                                            {item.satuan}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Jumlah</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(
                                                parseInt(e.target.value) || 1,
                                            )
                                        }
                                        placeholder="Jumlah"
                                    />
                                    {selectedItem && (
                                        <p className="text-xs text-muted-foreground">
                                            Stok tersedia: {selectedItem.stok}{' '}
                                            {selectedItem.satuan}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        onClick={handleAddItem}
                                        disabled={
                                            !selectedItemId || quantity <= 0
                                        }
                                        className="w-full"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items List */}
                    {requestItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Daftar Barang ({requestItems.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {requestItems.map((requestItem) => {
                                        const item = items.find(
                                            (i) => i.id === requestItem.item_id,
                                        );
                                        if (!item) return null;

                                        return (
                                            <div
                                                key={requestItem.item_id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {item.nama_barang}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.kode_barang} •
                                                        Stok: {item.stok}{' '}
                                                        {item.satuan}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            {
                                                                requestItem.jumlah_diminta
                                                            }{' '}
                                                            {item.satuan}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Diminta
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                requestItem.item_id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('atk-requests.index')}>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={
                                form.processing || requestItems.length === 0
                            }
                        >
                            {form.processing
                                ? 'Memproses...'
                                : 'Simpan Permintaan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
