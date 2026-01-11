import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle,
    DollarSign,
    FileText,
    PackageCheck,
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
    jumlah_diterima?: number | null;
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

interface ShowProps {
    purchase: Purchase;
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

export default function PurchaseShow({ purchase }: ShowProps) {
    const receiveForm = useForm({
        items: purchase.purchase_details.map((detail) => ({
            purchase_detail_id: detail.id,
            jumlah_diterima: detail.jumlah_diterima || detail.jumlah,
        })),
    });

    const handleReceive = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !confirm(
                `Apakah Anda yakin ingin menerima barang dari pembelian ${purchase.no_pembelian}?`,
            )
        ) {
            return;
        }

        receiveForm.post(route('purchases.receive', purchase), {
            onSuccess: () => {
                alert('Barang berhasil diterima.');
            },
        });
    };

    const handleComplete = () => {
        if (
            !confirm(
                `Apakah Anda yakin ingin menyelesaikan pembelian ${purchase.no_pembelian} dan mengupdate stok?`,
            )
        ) {
            return;
        }

        router.post(
            route('purchases.complete', purchase),
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

    const totalItems = purchase.purchase_details.reduce(
        (sum, detail) => sum + detail.jumlah,
        0,
    );

    return (
        <AppLayout
            breadcrumbs={[
                ...breadcrumbs,
                {
                    title: purchase.no_pembelian,
                    href: `/purchases/${purchase.id}`,
                },
            ]}
        >
            <Head title={`Pembelian ${purchase.no_pembelian}`} />

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
                                {purchase.no_pembelian}
                            </h1>
                            <p className="text-muted-foreground">
                                Detail pembelian ATK
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                statusColors[purchase.status]
                            }`}
                        >
                            {statusLabels[purchase.status]}
                        </span>
                    </div>
                </div>

                {/* Purchase Info Card */}
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <FileText className="h-5 w-5" />
                        Informasi Pembelian
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Tanggal
                                </p>
                                <p className="font-medium">
                                    {new Date(
                                        purchase.tanggal,
                                    ).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Supplier
                                </p>
                                <p className="font-medium">
                                    {purchase.supplier}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <PackageCheck className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Item
                                </p>
                                <p className="font-medium">
                                    {totalItems} barang
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Nilai
                                </p>
                                <p className="font-medium">
                                    {formatCurrency(purchase.total_nilai)}
                                </p>
                            </div>
                        </div>
                    </div>
                    {purchase.keterangan && (
                        <div className="mt-4 rounded-lg bg-muted/50 p-3">
                            <p className="text-sm text-muted-foreground">
                                Keterangan
                            </p>
                            <p className="text-sm">{purchase.keterangan}</p>
                        </div>
                    )}
                </div>

                {/* Receive Form (Draft status) */}
                {purchase.status === 'draft' && (
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <PackageCheck className="h-5 w-5" />
                            Penerimaan Barang
                        </h2>
                        <form onSubmit={handleReceive}>
                            <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            Penerimaan Barang
                                        </p>
                                        <p className="text-blue-700 dark:text-blue-300">
                                            Masukkan jumlah barang yang diterima
                                            sesuai dengan fisik. Jika ada
                                            selisih, dapat diinput di kolom
                                            jumlah diterima.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Kode Barang
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Nama Barang
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                Jumlah Order
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                Jumlah Diterima
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Harga Satuan
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchase.purchase_details.map(
                                            (detail, index) => (
                                                <tr
                                                    key={detail.id}
                                                    className="border-b"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {detail.item
                                                            ?.kode_barang ||
                                                            '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {detail.item
                                                            ?.nama_barang ||
                                                            '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {detail.jumlah}{' '}
                                                        {detail.item?.satuan}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={detail.jumlah}
                                                            value={
                                                                receiveForm.data
                                                                    .items[
                                                                    index
                                                                ]
                                                                    .jumlah_diterima
                                                            }
                                                            onChange={(e) =>
                                                                receiveForm.setData(
                                                                    `items.${index}.jumlah_diterima`,
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="w-24 rounded-md border bg-background px-2 py-1 text-center"
                                                        />
                                                        <span className="ml-1 text-xs text-muted-foreground">
                                                            {
                                                                detail.item
                                                                    ?.satuan
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {formatCurrency(
                                                            detail.harga_satuan,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatCurrency(
                                                            detail.subtotal,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link
                                    href={route('purchases.index')}
                                    className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={receiveForm.processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <PackageCheck className="h-4 w-4" />
                                    {receiveForm.processing
                                        ? 'Memproses...'
                                        : 'Terima Barang'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Items Table */}
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <PackageCheck className="h-5 w-5" />
                        Daftar Barang
                    </h2>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Kode Barang
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Nama Barang
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium">
                                        Jumlah
                                    </th>
                                    {purchase.status !== 'draft' && (
                                        <th className="px-4 py-3 text-center font-medium">
                                            Jumlah Diterima
                                        </th>
                                    )}
                                    <th className="px-4 py-3 text-right font-medium">
                                        Harga Satuan
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchase.purchase_details.map((detail) => (
                                    <tr key={detail.id} className="border-b">
                                        <td className="px-4 py-3 font-medium">
                                            {detail.item?.kode_barang || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {detail.item?.nama_barang || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {detail.jumlah}{' '}
                                            {detail.item?.satuan}
                                        </td>
                                        {purchase.status !== 'draft' && (
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={
                                                        detail.jumlah_diterima &&
                                                        detail.jumlah_diterima <
                                                            detail.jumlah
                                                            ? 'font-medium text-yellow-600 dark:text-yellow-400'
                                                            : ''
                                                    }
                                                >
                                                    {detail.jumlah_diterima ||
                                                        detail.jumlah}{' '}
                                                    {detail.item?.satuan}
                                                </span>
                                                {detail.jumlah_diterima &&
                                                    detail.jumlah_diterima <
                                                        detail.jumlah && (
                                                        <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                            (kurang{' '}
                                                            {detail.jumlah -
                                                                detail.jumlah_diterima}
                                                            )
                                                        </span>
                                                    )}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-right">
                                            {formatCurrency(
                                                detail.harga_satuan,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatCurrency(detail.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t bg-muted/50">
                                <tr>
                                    <td
                                        colSpan={
                                            purchase.status !== 'draft' ? 4 : 3
                                        }
                                        className="px-4 py-3 text-right font-semibold"
                                    >
                                        Total:
                                    </td>
                                    <td
                                        colSpan={
                                            purchase.status !== 'draft' ? 3 : 2
                                        }
                                        className="px-4 py-3 text-right text-lg font-bold"
                                    >
                                        {formatCurrency(purchase.total_nilai)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Complete Button (Received status) */}
                {purchase.status === 'received' && (
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Selesaikan Pembelian
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Klik tombol di bawah untuk menyelesaikan
                                    pembelian dan mengupdate stok barang.
                                </p>
                            </div>
                            <button
                                onClick={handleComplete}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Selesaikan & Update Stok
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
