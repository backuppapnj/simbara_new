import {
    exportByCategory,
    exportByCondition,
    exportByLocation,
    exportMaintenanceHistory,
    exportSaktiSiman,
    exportValueSummary,
    preview,
} from '@/actions/App/Http/Controllers/AssetReportController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Head, useForm } from '@inertiajs/react';
import { FileDown, FileText, Filter, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
        description:
            'Laporan aset dikelompokkan berdasarkan klasifikasi 14 digit',
        format: 'CSV',
    },
    {
        id: 'by_condition',
        label: 'Per Kondisi',
        description:
            'Laporan aset dikelompokkan berdasarkan kondisi (Baik, Rusak, dll)',
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
    const [selectedReport, setSelectedReport] =
        useState<ReportType>('sakti_siman');
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
            const params = new URLSearchParams();
            Object.entries(filterForm.data).forEach(([key, value]) => {
                if (value) params.append(key, value as string);
            });
            params.append('report_type', selectedReport);

            const response = await fetch(`${preview().url}?${params.toString()}`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPreviewData(data);
                toast.success('Data preview berhasil dimuat');
            } else {
                toast.error('Gagal memuat data preview');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memuat preview');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        setExporting(true);
        try {
            const exportActions: Record<
                ReportType,
                () => { url: string; method: string }
            > = {
                sakti_siman: exportSaktiSiman,
                by_location: exportByLocation,
                by_category: exportByCategory,
                by_condition: exportByCondition,
                maintenance_history: exportMaintenanceHistory,
                value_summary: exportValueSummary,
            };

            const exportAction = exportActions[selectedReport];
            const params = new URLSearchParams();
        Object.entries(filterForm.data).forEach(([key, value]) => {
            if (value) params.append(key, value as string);
        });

        const fullUrl = `${exportAction().url}?${params.toString()}`;
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
                                        {typeof row[col] === 'number' &&
                                        (col.includes('nilai') ||
                                            col.includes('value'))
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
                        {previewData.data
                            .slice(0, 10)
                            .map((row: any, idx: number) => (
                                <TableRow key={idx}>
                                    {columns.map((col: string) => (
                                        <TableCell key={col}>
                                            {typeof row[col] === 'number' &&
                                            (col.includes('nilai') ||
                                                col.includes('value') ||
                                                col.includes('rph'))
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Aset" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Laporan Aset
                    </h1>
                    <p className="text-muted-foreground">
                        Generate dan unduh berbagai laporan aset dalam format
                        CSV
                    </p>
                </div>

                {/* Report Type Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pilih Jenis Laporan</CardTitle>
                        <CardDescription>
                            Pilih jenis laporan yang ingin anda generate
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            value={selectedReport}
                            onValueChange={(value) =>
                                setSelectedReport(value as ReportType)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis laporan" />
                            </SelectTrigger>
                            <SelectContent>
                                {reportOptions.map((option) => (
                                    <SelectItem
                                        key={option.id}
                                        value={option.id}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <div>
                                                <div className="font-medium">
                                                    {option.label}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {option.description}
                                                </div>
                                            </div>
                                            <div className="ml-auto rounded bg-muted px-2 py-1 text-xs">
                                                {option.format}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Laporan
                        </CardTitle>
                        <CardDescription>
                            Atur filter untuk mempersempit data laporan
                            (opsional)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    value={filterForm.data.start_date}
                                    onChange={(e) =>
                                        filterForm.setData(
                                            'start_date',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Tanggal Akhir
                                </label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    value={filterForm.data.end_date}
                                    onChange={(e) =>
                                        filterForm.setData(
                                            'end_date',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {selectedReport !== 'maintenance_history' && (
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Lokasi
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        placeholder="Cth: Ruang Aula"
                                        value={filterForm.data.location}
                                        onChange={(e) =>
                                            filterForm.setData(
                                                'location',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Kategori (Kode Barang)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        placeholder="Cth: 1.3.2.01.01.001"
                                        value={filterForm.data.category}
                                        onChange={(e) =>
                                            filterForm.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Kondisi
                                    </label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        value={filterForm.data.condition}
                                        onChange={(e) =>
                                            filterForm.setData(
                                                'condition',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Semua Kondisi</option>
                                        <option value="Baik">Baik</option>
                                        <option value="Rusak Ringan">
                                            Rusak Ringan
                                        </option>
                                        <option value="Rusak Berat">
                                            Rusak Berat
                                        </option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handlePreview}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Memuat...
                                    </>
                                ) : (
                                    <>
                                        <Filter className="mr-2 h-4 w-4" />
                                        Preview Data
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    filterForm.reset();
                                    setPreviewData(null);
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview & Export */}
                {previewData && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Preview Laporan</CardTitle>
                                    <CardDescription>
                                        {previewData.report_type} - Menampilkan{' '}
                                        {previewData.data?.length ||
                                            previewData.summary?.length ||
                                            0}{' '}
                                        dari{' '}
                                        {previewData.total ||
                                            previewData.total_assets ||
                                            0}{' '}
                                        data
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={handleExport}
                                    disabled={exporting}
                                    variant="default"
                                    size="sm"
                                >
                                    {exporting ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Mendownload...
                                        </>
                                    ) : (
                                        <>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            Export CSV
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {renderPreviewTable()}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
