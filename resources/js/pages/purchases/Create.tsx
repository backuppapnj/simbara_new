import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    FileText,
    Package,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pembelian ATK',
        href: '/purchases',
    },
    {
        title: 'Buat Pembelian',
        href: '/purchases/create',
    },
];

interface Item {
    id: string;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    harga_rata_rata: number | null;
}

interface CreateProps {
    items: Item[];
}

interface PurchaseItem {
    item_id: string;
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function PurchaseCreate({ items }: CreateProps) {
    const [tanggal, setTanggal] = useState(
        new Date().toISOString().split('T')[0],
    );
    const [supplier, setSupplier] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

    const addItem = () => {
        setPurchaseItems([
            ...purchaseItems,
            {
                item_id: '',
                jumlah: 1,
                harga_satuan: 0,
                subtotal: 0,
            },
        ]);
    };

    const removeItem = (index: number) => {
        setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    };

    const updateItem = (
        index: number,
        field: keyof PurchaseItem,
        value: string | number,
    ) => {
        const updatedItems = [...purchaseItems];
        const item = updatedItems[index];

        if (field === 'item_id') {
            const selectedItem = items.find((i) => i.id === value);
            item.item_id = value as string;
            item.harga_satuan = selectedItem?.harga_rata_rata || 0;
        } else if (field === 'jumlah') {
            item.jumlah = parseInt(value as string) || 0;
        } else if (field === 'harga_satuan') {
            item.harga_satuan = parseFloat(value as string) || 0;
        }

        item.subtotal = item.jumlah * item.harga_satuan;
        setPurchaseItems(updatedItems);
    };

    const totalNilai = purchaseItems.reduce(
        (sum, item) => sum + item.subtotal,
        0,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!tanggal) {
            alert('Tanggal wajib diisi');
            return;
        }
        if (!supplier.trim()) {
            alert('Supplier wajib diisi');
            return;
        }
        if (purchaseItems.length === 0) {
            alert('Minimal satu barang harus ditambahkan');
            return;
        }

        const invalidItems = purchaseItems.filter(
            (item) =>
                !item.item_id || item.jumlah <= 0 || item.harga_satuan <= 0,
        );
        if (invalidItems.length > 0) {
            alert(
                'Pastikan semua barang terisi dengan benar (item, jumlah, dan harga)',
            );
            return;
        }

        if (!confirm('Apakah Anda yakin ingin membuat pembelian ini?')) {
            return;
        }

        router.post(
            route('purchases.store'),
            {
                tanggal,
                supplier,
                keterangan,
                items: purchaseItems,
            },
            {
                onSuccess: () => {
                    alert('Pembelian berhasil dibuat.');
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    alert('Terjadi kesalahan saat menyimpan pembelian.');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pembelian ATK" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('purchases.index')}
                            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Buat Pembelian Baru
                            </h1>
                            <p className="text-muted-foreground">
                                Input pembelian ATK dari supplier
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Purchase Info */}
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <FileText className="h-5 w-5" />
                            Informasi Pembelian
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="tanggal"
                                    className="text-sm font-medium"
                                >
                                    Tanggal{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="tanggal"
                                        type="date"
                                        value={tanggal}
                                        onChange={(e) =>
                                            setTanggal(e.target.value)
                                        }
                                        required
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="supplier"
                                    className="text-sm font-medium"
                                >
                                    Supplier{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="supplier"
                                        type="text"
                                        value={supplier}
                                        onChange={(e) =>
                                            setSupplier(e.target.value)
                                        }
                                        placeholder="Nama supplier"
                                        required
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label
                                    htmlFor="keterangan"
                                    className="text-sm font-medium"
                                >
                                    Keterangan
                                </label>
                                <textarea
                                    id="keterangan"
                                    value={keterangan}
                                    onChange={(e) =>
                                        setKeterangan(e.target.value)
                                    }
                                    placeholder="Catatan tambahan (opsional)"
                                    rows={2}
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-xl border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold">
                                <Package className="h-5 w-5" />
                                Daftar Barang
                            </h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Barang
                            </button>
                        </div>

                        {purchaseItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-lg font-medium">
                                    Belum ada barang
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Klik tombol &quot;Tambah Barang&quot; untuk
                                    memulai
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {purchaseItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-start"
                                    >
                                        <div className="flex-1">
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                Barang{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                value={item.item_id}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        'item_id',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                                required
                                            >
                                                <option value="">
                                                    Pilih barang...
                                                </option>
                                                {items.map((i) => (
                                                    <option
                                                        key={i.id}
                                                        value={i.id}
                                                    >
                                                        {i.kode_barang} -{' '}
                                                        {i.nama_barang}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="w-full md:w-32">
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                Jumlah{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.jumlah}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        'jumlah',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                                required
                                            />
                                        </div>

                                        <div className="w-full md:w-40">
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                Harga Satuan{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={item.harga_satuan}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        'harga_satuan',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                                required
                                            />
                                        </div>

                                        <div className="w-full md:w-40">
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                Subtotal
                                            </label>
                                            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm font-medium">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {purchaseItems.length > 0 && (
                        <div className="rounded-xl border bg-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Total Nilai Pembelian
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {purchaseItems.length} barang dengan
                                        total nilai
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-primary">
                                        {formatCurrency(totalNilai)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 rounded-xl border bg-card p-6">
                        <Link
                            href={route('purchases.index')}
                            className="rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-muted"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={purchaseItems.length === 0}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            Simpan Pembelian
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
