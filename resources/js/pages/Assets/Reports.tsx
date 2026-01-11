import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
    Download,
    FileDown,
    FileText,
    Filter,
    RefreshCw,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Aset',
        href: '/assets',
    },
    {
        title: 'Laporan',
        href: '/assets/reports',
    },
];

type ReportType =
    | 'sakti_siman'
    | 'by_location'
    | 'by_category'
    | 'by_condition'
    | 'maintenance_history'
    | 'value_summary';

interface ReportOption {
    id: ReportType;
    label: string;
    description: string;
    format: string;
}

const reportOptions: ReportOption[] = [
    {
        id: 'sakti_siman',
        label: 'Export SAKTI/SIMAN',
        description: 'Format standar Kemenkeu untuk integrasi SAKTI/SIMAN',
        format: 'CSV',
    },
    {
        id: 'by_location',
        label: 'Per Lokasi',
        description: 'Laporan aset dikelompokkan berdasarkan lokasi/ruangan',
        format: 'CSV',
    },
    {
        id: 'by_category',
        label: 'Per Kategori',
        description: 'Laporan aset dikelompokkan berdasarkan klasifikasi 14 digit',
        format: 'CSV',
    },
    {
        id: 'by_condition',
        label: 'Per Kondisi',
        description: 'Laporan aset dikelompokkan berdasarkan kondisi (Baik, Rusak, dll)',
        format: 'CSV',
    },
    {
        id: 'maintenance_history',
        label: 'Riwayat Perawatan',
        description: 'Laporan riwayat perawatan dan perbaikan aset',
        format: 'CSV',
    },
    {
        id: 'value_summary',
        label: 'Ringkasan Nilai',
        description: 'Ringkasan nilai aset dan buku per kategori',
        format: 'CSV',
    },
];

export default function AssetReports() {
    const [selectedReport, setSelectedReport] = useState<ReportType>('sakti_siman');
    const [previewData, setPreviewData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const filterForm = useForm({
        start_date: '',
        end_date: '',
        location: '',
        category: '',
        condition: '',
    });

    const handlePreview = async () => {
        setLoading(true);
        setPreviewData(null);
        try {
            await filterForm.post('/assets/reports/preview', {
                data: {
                    report_type: selectedReport,
                    ...filterForm.data(),
                },
                onSuccess: (page) => {
                    const data = (page.props as any).preview;
                    setPreviewData(data);
                    toast.success('Data preview berhasil dimuat');
                },
                onError: () => {
                    toast.error('Gagal memuat data preview');
                },
            });
        } catch (error) {
            toast.error('Terjadi kesalahan saat memuat preview');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        setExporting(true);
        try {
            const exportRoutes: Record<ReportType, string> = {
                sakti_siman: 'assets.reports.export.sakti-siman',
                by_location: 'assets.reports.export.by-location',
                by_category: 'assets.reports.export.by-category',
                by_condition: 'assets.reports.export.by-condition',
                maintenance_history: 'assets.reports.export.maintenance-history',
                value_summary: 'assets.reports.export.value-summary',
            };

            const url = route(exportRoutes[selectedReport]);
            const params = new URLSearchParams();
            Object.entries(filterForm.data()).forEach(([key, value]) => {
                if (value) params.append(key, value as string);
            });

            const fullUrl = `${url}?${params.toString()}`;
            window.open(fullUrl, '_blank');
            toast.success('Laporan sedang diunduh');
        } catch (error) {
            toast.error('Gagal mengunduh laporan');
        } finally {
            setExporting(false);
        }
    };

    const renderPreviewTable = () => {
        if (!previewData) return null;

        if (previewData.summary && previewData.summary.length > 0) {
            const firstItem = previewData.summary[0];
            const columns = Object.keys(firstItem);

            return (
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col: string) => (
                                <TableHead key={col} className="capitalize">
                                    {col.replace(/_/g, ' ')}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {previewData.summary.map((row: any, idx: number) => (
                            <TableRow key={idx}>
                                {columns.map((col: string) => (
                                    <TableCell key={col}>
                                        {typeof row[col] === 'number' && (col.includes('nilai') || col.includes('value'))
                                            ? `Rp ${row[col].toLocaleString('id-ID')}`
                                            : row[col]}
                                        </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        if (previewData.data && previewData.data.length > 0) {
            const firstItem = previewData.data[0];
            const columns = Object.keys(firstItem).slice(0, 8);

            return (
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col: string) => (
                                <TableHead key={col} className="capitalize">
                                    {col.replace(/_/g, ' ')}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {previewData.data.slice(0, 10).map((row: any, idx: number) => (
                            <TableRow key={idx}>
                                {columns.map((col: string) => (
                                    <TableCell key={col}>
                                        {typeof row[col] === 'number' && (col.includes('nilai') || col.includes('value') || col.includes('rph'))
                                            ? `Rp ${row[col].toLocaleString('id-ID')}`
                                            : row[col]?.toString() || '-'}
                                        </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
                Tidak ada data untuk ditampilkan
            </div>
        );
    };

    return (
        <>
            <Head title="Laporan Aset BMN" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">Laporan Aset BMN</h1>
                        <p className="mt-2 text-gray-600">
                            Pilih jenis laporan dan atur filter untuk mengekspor data aset.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Report Selection */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Jenis Laporan</h2>
                                <div className="space-y-3">
                                    {reportOptions.map((option) => (
                                        <label
                                            key={option.id}
                                            className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                                selectedReport === option.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="report_type"
                                                value={option.id}
                                                checked={selectedReport === option.id}
                                                onChange={(e) => setSelectedReport(e.target.value as ReportType)}
                                                className="sr-only"
                                            />
                                            <span className="font-medium text-gray-900">{option.label}</span>
                                            <span className="text-sm text-gray-500 mt-1">{option.description}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Filter</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="date_from" className="block text-sm font-medium text-gray-700">
                                            Tanggal Awal
                                        </label>
                                        <input
                                            type="date"
                                            id="date_from"
                                            value={filterForm.data('date_from')}
                                            onChange={(e) => filterForm.setData('date_from', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="date_to" className="block text-sm font-medium text-gray-700">
                                            Tanggal Akhir
                                        </label>
                                        <input
                                            type="date"
                                            id="date_to"
                                            value={filterForm.data('date_to')}
                                            onChange={(e) => filterForm.setData('date_to', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="kd_brg" className="block text-sm font-medium text-gray-700">
                                            Kode Barang
                                        </label>
                                        <input
                                            type="text"
                                            id="kd_brg"
                                            placeholder="Contoh: 2010104026"
                                            value={filterForm.data('kd_brg')}
                                            onChange={(e) => filterForm.setData('kd_brg', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="kd_kondisi" className="block text-sm font-medium text-gray-700">
                                            Kondisi
                                        </label>
                                        <select
                                            id="kd_kondisi"
                                            value={filterForm.data('kd_kondisi')}
                                            onChange={(e) => filterForm.setData('kd_kondisi', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Semua Kondisi</option>
                                            <option value="1">1 - Baik</option>
                                            <option value="2">2 - Rusak Ringan</option>
                                            <option value="3">3 - Rusak Berat</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    disabled={loading}
                                    className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Memuat...' : 'Preview'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>

                                {!previewData ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="mt-2">Klik "Preview" untuk melihat data laporan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm font-medium text-gray-700">Tipe Laporan: {previewData.report_type}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Total: {previewData.total ?? previewData.total_assets ?? 0} records
                                            </p>
                                        </div>

                                        {previewData.data && (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            {Object.keys(previewData.data[0] || {}).map((key) => (
                                                                <th
                                                                    key={key}
                                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                >
                                                                    {key}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {previewData.data.slice(0, 10).map((row: any, index: number) => (
                                                            <tr key={index}>
                                                                {Object.values(row).map((value: any, i) => (
                                                                    <td
                                                                        key={i}
                                                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                                                    >
                                                                        {value?.toString() || '-'}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {previewData.data.length > 10 && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Menampilkan 10 dari {previewData.data.length} records
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {previewData.summary && (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            {Object.keys(previewData.summary[0] || {}).map((key) => (
                                                                <th
                                                                    key={key}
                                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                >
                                                                    {key}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {previewData.summary.map((row: any, index: number) => (
                                                            <tr key={index}>
                                                                {Object.values(row).map((value: any, i) => (
                                                                    <td
                                                                        key={i}
                                                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                                                    >
                                                                        {value?.toString() || '-'}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
