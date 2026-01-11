import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Camera,
    Check,
    Download,
    FileCheck,
} from 'lucide-react';
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
        title: 'Detail',
        href: '',
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
    photos?: Array<{
        id: string;
        file_path: string;
        file_name: string;
        url?: string;
    }>;
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
    approved_at?: string;
}

interface ShowProps {
    stockOpname: StockOpname;
}

const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    approved:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const statusLabels = {
    draft: 'Draft',
    completed: 'Selesai',
    approved: 'Disetujui',
};

export default function Show({ stockOpname }: ShowProps) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
        null,
    );
    const [selectedDetailPhotos, setSelectedDetailPhotos] = useState<
        StockOpnameDetail['photos']
    >([]);

    const handleStatusChange = (action: 'submit' | 'approve') => {
        if (
            !confirm(
                `Apakah Anda yakin ingin ${action === 'submit' ? 'mensubmit' : 'mengapprove'} stock opname ini?`,
            )
        ) {
            return;
        }

        router.post(
            route(`stock-opnames.${action}`, stockOpname),
            {},
            {
                onSuccess: () => {
                    alert(
                        `Stock opname berhasil ${action === 'submit' ? 'disubmit' : 'diapprove'}`,
                    );
                },
            },
        );
    };

    const openPhotoGallery = (
        photos: StockOpnameDetail['photos'],
        index: number,
    ) => {
        if (photos && photos.length > 0) {
            setSelectedDetailPhotos(photos);
            setSelectedPhotoIndex(index);
        }
    };

    const closePhotoGallery = () => {
        setSelectedPhotoIndex(null);
        setSelectedDetailPhotos([]);
    };

    const getPhotoUrl = (photo: { file_path: string }): string => {
        return `/storage/${photo.file_path}`;
    };

    const handleDownloadBa = () => {
        window.location.href = route('stock-opnames.ba-pdf', stockOpname);
    };

    const totalItems = stockOpname.stock_opname_details.length;
    const itemsWithSelisih = stockOpname.stock_opname_details.filter(
        (detail) => detail.selisih !== 0,
    );
    const selisihPositif = stockOpname.stock_opname_details
        .filter((detail) => detail.selisih > 0)
        .reduce((sum, detail) => sum + detail.selisih, 0);
    const selisihNegatif = stockOpname.stock_opname_details
        .filter((detail) => detail.selisih < 0)
        .reduce((sum, detail) => sum + detail.selisih, 0);
    const totalSelisih = selisihPositif + selisihNegatif;

    const hasSelisih = itemsWithSelisih.length > 0;
    const hasPhotos = stockOpname.stock_opname_details.some(
        (detail) => detail.photos && detail.photos.length > 0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Stock Opname - ${stockOpname.no_so}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
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
                                {stockOpname.no_so}
                            </h1>
                            <p className="text-muted-foreground">
                                Detail Stock Opname
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                statusColors[stockOpname.status]
                            }`}
                        >
                            {statusLabels[stockOpname.status]}
                        </span>

                        {stockOpname.status === 'draft' && (
                            <button
                                onClick={() => handleStatusChange('submit')}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Check className="h-4 w-4" />
                                Submit
                            </button>
                        )}

                        {stockOpname.status === 'completed' && (
                            <button
                                onClick={() => handleStatusChange('approve')}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                <FileCheck className="h-4 w-4" />
                                Approve
                            </button>
                        )}

                        {stockOpname.status === 'approved' && (
                            <button
                                onClick={handleDownloadBa}
                                className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                            >
                                <Download className="h-4 w-4" />
                                Download BA
                            </button>
                        )}
                    </div>
                </div>

                {/* Informasi Stock Opname */}
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Informasi Stock Opname
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <div className="text-sm text-muted-foreground">
                                Nomor SO
                            </div>
                            <div className="font-medium">
                                {stockOpname.no_so}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground">
                                Tanggal
                            </div>
                            <div className="font-medium">
                                {new Date(
                                    stockOpname.tanggal,
                                ).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground">
                                Periode
                            </div>
                            <div className="font-medium">
                                {stockOpname.periode_bulan}{' '}
                                {stockOpname.periode_tahun}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground">
                                Status
                            </div>
                            <div className="font-medium">
                                {statusLabels[stockOpname.status]}
                            </div>
                        </div>

                        {stockOpname.approver && (
                            <>
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Disetujui Oleh
                                    </div>
                                    <div className="font-medium">
                                        {stockOpname.approver.name}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        Tanggal Approval
                                    </div>
                                    <div className="font-medium">
                                        {stockOpname.approved_at &&
                                            new Date(
                                                stockOpname.approved_at,
                                            ).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                    </div>
                                </div>
                            </>
                        )}

                        {stockOpname.keterangan && (
                            <div className="md:col-span-2">
                                <div className="text-sm text-muted-foreground">
                                    Keterangan
                                </div>
                                <div className="font-medium">
                                    {stockOpname.keterangan}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Total Barang
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                            {totalItems}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Selisih Positif
                        </div>
                        <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                            {selisihPositif > 0 && '+'}
                            {selisihPositif}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Selisih Negatif
                        </div>
                        <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                            {selisihNegatif < 0 && ''}
                            {selisihNegatif}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Dengan Foto
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                            {
                                stockOpname.stock_opname_details.filter(
                                    (detail) =>
                                        detail.photos &&
                                        detail.photos.length > 0,
                                ).length
                            }
                        </div>
                    </div>
                </div>

                {hasSelisih && (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-950">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                                Terdapat {itemsWithSelisih.length} Barang dengan
                                Selisih
                            </h3>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Total selisih positif:{' '}
                                <span className="font-bold text-green-700 dark:text-green-300">
                                    +{selisihPositif}
                                </span>
                            </p>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Total selisih negatif:{' '}
                                <span className="font-bold text-red-700 dark:text-red-300">
                                    {selisihNegatif}
                                </span>
                            </p>
                        </div>
                        {stockOpname.status === 'approved' && (
                            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                                Stok telah disesuaikan secara otomatis
                            </p>
                        )}
                    </div>
                )}

                {/* Detail Barang */}
                <div className="rounded-xl border bg-card">
                    <div className="border-b p-6">
                        <h2 className="text-lg font-semibold">Detail Barang</h2>
                        <p className="text-sm text-muted-foreground">
                            Total {stockOpname.stock_opname_details.length}{' '}
                            barang
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Barang
                                    </th>
                                    <th className="px-6 py-3 text-center font-medium">
                                        Stok Sistem
                                    </th>
                                    <th className="px-6 py-3 text-center font-medium">
                                        Stok Fisik
                                    </th>
                                    <th className="px-6 py-3 text-center font-medium">
                                        Selisih
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Keterangan
                                    </th>
                                    {hasPhotos && (
                                        <th className="px-6 py-3 text-center font-medium">
                                            Foto
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {stockOpname.stock_opname_details.map(
                                    (detail) => (
                                        <tr
                                            key={detail.id}
                                            className="border-t"
                                        >
                                            <td className="px-6 py-3">
                                                <div className="font-medium">
                                                    {detail.item?.nama_barang}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {detail.item?.kode_barang}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                {detail.stok_sistem}{' '}
                                                {detail.item?.satuan}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                {detail.stok_fisik}{' '}
                                                {detail.item?.satuan}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        detail.selisih > 0
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : detail.selisih < 0
                                                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                    }`}
                                                >
                                                    {detail.selisih > 0 && '+'}
                                                    {detail.selisih}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-muted-foreground">
                                                {detail.keterangan || '-'}
                                            </td>
                                            {hasPhotos && (
                                                <td className="px-6 py-3 text-center">
                                                    {detail.photos &&
                                                    detail.photos.length > 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openPhotoGallery(
                                                                    detail.photos,
                                                                    0,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
                                                        >
                                                            <Camera className="h-3 w-3" />
                                                            {
                                                                detail.photos
                                                                    .length
                                                            }
                                                        </button>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Photo Gallery Modal */}
                {selectedPhotoIndex !== null &&
                    selectedDetailPhotos.length > 0 && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                            <div className="relative max-h-full max-w-full">
                                <button
                                    onClick={closePhotoGallery}
                                    className="absolute -top-12 -right-12 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:ring-2 focus:ring-white focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                                <img
                                    src={getPhotoUrl(
                                        selectedDetailPhotos[
                                            selectedPhotoIndex
                                        ],
                                    )}
                                    alt={`Photo ${selectedPhotoIndex + 1}`}
                                    className="max-h-[80vh] max-w-full rounded-lg object-contain"
                                />

                                {/* Photo Navigation */}
                                {selectedDetailPhotos.length > 1 && (
                                    <div className="mt-4 flex items-center justify-center gap-4">
                                        <button
                                            onClick={() =>
                                                setSelectedPhotoIndex((prev) =>
                                                    prev === null
                                                        ? 0
                                                        : prev > 0
                                                          ? prev - 1
                                                          : selectedDetailPhotos.length -
                                                            1,
                                                )
                                            }
                                            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                        >
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 19l-7-7 7-7"
                                                />
                                            </svg>
                                        </button>

                                        <span className="text-sm font-medium text-white">
                                            {selectedPhotoIndex + 1} /{' '}
                                            {selectedDetailPhotos.length}
                                        </span>

                                        <button
                                            onClick={() =>
                                                setSelectedPhotoIndex((prev) =>
                                                    prev === null
                                                        ? 0
                                                        : prev <
                                                            selectedDetailPhotos.length -
                                                                1
                                                          ? prev + 1
                                                          : 0,
                                                )
                                            }
                                            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                        >
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
            </div>
        </AppLayout>
    );
}
