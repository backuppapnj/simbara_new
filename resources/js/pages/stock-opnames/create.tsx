import {
    ItemPhotoCapture,
    type CapturedPhoto,
} from '@/components/stock-opname/item-photo-capture';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Camera, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Stock Opname',
        href: '/stock-opnames',
    },
    {
        title: 'Buat Stock Opname',
        href: '/stock-opnames/create',
    },
];

interface Item {
    id: string;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    stok: number;
    kategori: string;
}

interface CreateProps {
    items: Item[];
}

export default function Create({ items }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        periode_bulan: new Date().toLocaleString('id-ID', { month: 'long' }),
        periode_tahun: new Date().getFullYear(),
        keterangan: '',
        details: [] as Array<{
            item_id: string;
            stok_sistem: number;
            stok_fisik: number;
            keterangan: string;
            photos: CapturedPhoto[];
        }>,
    });

    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const handleAddItem = (itemId: string) => {
        if (selectedItems.has(itemId)) return;

        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        setSelectedItems((prev) => new Set(prev).add(itemId));
        setData('details', [
            ...data.details,
            {
                item_id: itemId,
                stok_sistem: item.stok,
                stok_fisik: item.stok,
                keterangan: '',
                photos: [],
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        const newDetails = [...data.details];
        const removedItem = newDetails[index];
        newDetails.splice(index, 1);
        setData('details', newDetails);

        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(removedItem.item_id);
            return newSet;
        });
    };

    const handleDetailChange = (
        index: number,
        field: string,
        value: string | number | CapturedPhoto[],
    ) => {
        const newDetails = [...data.details];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setData('details', newDetails);
    };

    const toggleItemExpanded = (index: number) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const calculateSelisih = (index: number) => {
        const detail = data.details[index];
        return detail.stok_fisik - detail.stok_sistem;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.details.length === 0) {
            alert('Mohon pilih minimal satu barang');
            return;
        }

        // Convert photos data to FormData for file upload
        const formData = new FormData();
        formData.append('tanggal', data.tanggal);
        formData.append('periode_bulan', data.periode_bulan);
        formData.append('periode_tahun', data.periode_tahun.toString());
        formData.append('keterangan', data.keterangan);

        data.details.forEach((detail, index) => {
            formData.append(`details[${index}][item_id]`, detail.item_id);
            formData.append(
                `details[${index}][stok_sistem]`,
                detail.stok_sistem.toString(),
            );
            formData.append(
                `details[${index}][stok_fisik]`,
                detail.stok_fisik.toString(),
            );
            formData.append(`details[${index}][keterangan]`, detail.keterangan);

            // Attach photos if any
            if (detail.photos && detail.photos.length > 0) {
                detail.photos.forEach((photo) => {
                    if (photo.file instanceof File) {
                        formData.append(
                            `details[${index}][photos][]`,
                            photo.file,
                        );
                    }
                });
            }
        });

        post(route('stock-opnames.store'), {
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            forceFormData: true,
        });
    };

    const availableItems = items.filter((item) => !selectedItems.has(item.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Stock Opname" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={route('stock-opnames.index')}
                        className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Buat Stock Opname
                        </h1>
                        <p className="text-muted-foreground">
                            Input hasil hitung fisik barang
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-1 flex-col gap-6"
                >
                    {/* Informasi Stock Opname */}
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Informasi Stock Opname
                        </h2>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="tanggal"
                                    className="text-sm font-medium"
                                >
                                    Tanggal Stock Opname{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="tanggal"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={(e) =>
                                        setData('tanggal', e.target.value)
                                    }
                                    className={`rounded-md border bg-background px-3 py-2 ${
                                        errors.tanggal ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {errors.tanggal && (
                                    <p className="text-xs text-red-500">
                                        {errors.tanggal}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="bulan"
                                    className="text-sm font-medium"
                                >
                                    Periode Bulan{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="bulan"
                                    value={data.periode_bulan}
                                    onChange={(e) =>
                                        setData('periode_bulan', e.target.value)
                                    }
                                    className={`rounded-md border bg-background px-3 py-2 ${
                                        errors.periode_bulan
                                            ? 'border-red-500'
                                            : ''
                                    }`}
                                    required
                                >
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
                                {errors.periode_bulan && (
                                    <p className="text-xs text-red-500">
                                        {errors.periode_bulan}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="tahun"
                                    className="text-sm font-medium"
                                >
                                    Periode Tahun{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="tahun"
                                    type="number"
                                    value={data.periode_tahun}
                                    onChange={(e) =>
                                        setData(
                                            'periode_tahun',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    min="2020"
                                    max="2100"
                                    className={`rounded-md border bg-background px-3 py-2 ${
                                        errors.periode_tahun
                                            ? 'border-red-500'
                                            : ''
                                    }`}
                                    required
                                />
                                {errors.periode_tahun && (
                                    <p className="text-xs text-red-500">
                                        {errors.periode_tahun}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-3">
                                <label
                                    htmlFor="keterangan"
                                    className="text-sm font-medium"
                                >
                                    Keterangan
                                </label>
                                <textarea
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={(e) =>
                                        setData('keterangan', e.target.value)
                                    }
                                    rows={3}
                                    className="rounded-md border bg-background px-3 py-2"
                                    placeholder="Catatan tambahan..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pilih Barang */}
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Tambah Barang
                        </h2>

                        <div className="mb-4 max-h-64 overflow-y-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">
                                            Kode
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium">
                                            Nama Barang
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium">
                                            Kategori
                                        </th>
                                        <th className="px-4 py-2 text-center font-medium">
                                            Stok
                                        </th>
                                        <th className="px-4 py-2 text-center font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableItems.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-4 text-center text-muted-foreground"
                                            >
                                                Semua barang sudah ditambahkan
                                            </td>
                                        </tr>
                                    ) : (
                                        availableItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t"
                                            >
                                                <td className="px-4 py-2">
                                                    {item.kode_barang}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {item.nama_barang}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {item.kategori}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {item.stok}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleAddItem(
                                                                item.id,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Tambah
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Daftar Barang Stock Opname */}
                    {data.details.length > 0 && (
                        <div className="rounded-xl border bg-card p-6">
                            <h2 className="mb-4 text-lg font-semibold">
                                Daftar Barang
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Barang
                                            </th>
                                            <th className="px-4 py-2 text-center font-medium">
                                                Stok Sistem
                                            </th>
                                            <th className="px-4 py-2 text-center font-medium">
                                                Stok Fisik
                                            </th>
                                            <th className="px-4 py-2 text-center font-medium">
                                                Selisih
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Keterangan
                                            </th>
                                            <th className="px-4 py-2 text-center font-medium">
                                                Foto
                                            </th>
                                            <th className="px-4 py-2 text-center font-medium">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.details.map((detail, index) => {
                                            const item = items.find(
                                                (i) => i.id === detail.item_id,
                                            );
                                            const selisih =
                                                calculateSelisih(index);
                                            const isExpanded =
                                                expandedItems.has(index);
                                            const hasPhotos =
                                                detail.photos &&
                                                detail.photos.length > 0;

                                            return (
                                                <>
                                                    <tr
                                                        key={index}
                                                        className="border-t"
                                                    >
                                                        <td className="px-4 py-2">
                                                            <div className="font-medium">
                                                                {
                                                                    item?.nama_barang
                                                                }
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    item?.kode_barang
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <input
                                                                type="number"
                                                                value={
                                                                    detail.stok_sistem
                                                                }
                                                                readOnly
                                                                className="w-20 rounded-md border bg-muted px-2 py-1 text-center"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <input
                                                                type="number"
                                                                value={
                                                                    detail.stok_fisik
                                                                }
                                                                onChange={(e) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'stok_fisik',
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                    )
                                                                }
                                                                className="w-20 rounded-md border bg-background px-2 py-1 text-center"
                                                                min="0"
                                                                required
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-center font-medium">
                                                            <span
                                                                className={
                                                                    selisih > 0
                                                                        ? 'text-green-600 dark:text-green-400'
                                                                        : selisih <
                                                                            0
                                                                          ? 'text-red-600 dark:text-red-400'
                                                                          : ''
                                                                }
                                                            >
                                                                {selisih > 0 &&
                                                                    '+'}
                                                                {selisih}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="text"
                                                                value={
                                                                    detail.keterangan
                                                                }
                                                                onChange={(e) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'keterangan',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-md border bg-background px-2 py-1"
                                                                placeholder="Keterangan selisih..."
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleItemExpanded(
                                                                        index,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
                                                            >
                                                                <Camera className="h-3 w-3" />
                                                                {hasPhotos
                                                                    ? `(${detail.photos.length})`
                                                                    : 'Tambah'}
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveItem(
                                                                        index,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* Expandable Photo Row */}
                                                    {isExpanded && (
                                                        <tr className="border-t bg-muted/30">
                                                            <td
                                                                colSpan={7}
                                                                className="px-4 py-4"
                                                            >
                                                                <div className="max-w-2xl">
                                                                    <h4 className="mb-3 text-sm font-medium">
                                                                        Foto
                                                                        Dokumentasi
                                                                        Barang
                                                                    </h4>
                                                                    <ItemPhotoCapture
                                                                        photos={
                                                                            detail.photos
                                                                        }
                                                                        onPhotosChange={(
                                                                            photos,
                                                                        ) =>
                                                                            handleDetailChange(
                                                                                index,
                                                                                'photos',
                                                                                photos,
                                                                            )
                                                                        }
                                                                        maxPhotos={
                                                                            3
                                                                        }
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {errors.details && (
                        <p className="text-sm text-red-500">{errors.details}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 rounded-xl border bg-card p-6">
                        <Link
                            href={route('stock-opnames.index')}
                            className="inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || data.details.length === 0}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {processing
                                ? 'Menyimpan...'
                                : 'Simpan Stock Opname'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
