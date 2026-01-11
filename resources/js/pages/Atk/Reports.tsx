import {
    monthlyExcel,
    monthlyPdf,
    stockCardPdf,
} from '@/actions/App/Http/Controllers/AtkReportController';
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
import { Head } from '@inertiajs/react';
import {
    Download,
    FileDown,
    FileText,
    Filter,
    RefreshCw,
    TrendingDown,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ATK',
        href: '/atk-requests',
    },
    {
        title: 'Laporan',
        href: '/atk-reports',
    },
];

type ReportType =
    | 'stock_card'
    | 'monthly'
    | 'requests'
    | 'purchases'
    | 'distributions'
    | 'low_stock';

interface ReportFilter {
    start_date?: string;
    end_date?: string;
    item_id?: string;
    user_id?: string;
    department_id?: string;
    supplier?: string;
    status?: string;
    bulan?: string;
    tahun?: string;
}

interface PreviewData {
    data?: Array<Record<string, any>>;
    summary?: Record<string, any>;
    period?: Record<string, any>;
    item?: Record<string, any>;
    mutations?: Array<Record<string, any>>;
    total?: number;
}

const reportTypes: Array<{
    value: ReportType;
    label: string;
    description: string;
    format: string;
}> = [
    {
        value: 'stock_card',
        label: 'Kartu Stok',
        description: 'Laporan kartu stok per item dengan riwayat mutasi',
        format: 'PDF',
    },
    {
        value: 'monthly',
        label: 'Laporan Bulanan',
        description: 'Ringkasan bulanan pembelian, permintaan, dan stok opname',
        format: 'PDF/CSV',
    },
    {
        value: 'requests',
        label: 'Riwayat Permintaan',
        description: 'Riwayat permintaan ATK dengan status dan detail',
        format: 'CSV',
    },
    {
        value: 'purchases',
        label: 'Riwayat Pembelian',
        description: 'Riwayat pembelian ATK dari supplier',
        format: 'CSV',
    },
    {
        value: 'distributions',
        label: 'Laporan Distribusi',
        description: 'Laporan distribusi ATK ke pengguna',
        format: 'CSV',
    },
    {
        value: 'low_stock',
        label: 'Stok Menipis',
        description: 'Daftar item dengan stok di bawah minimum',
        format: 'CSV',
    },
];

export default function AtkReports() {
    const [reportType, setReportType] = useState<ReportType>('monthly');
    const [filters, setFilters] = useState<ReportFilter>({
        bulan: new Date().getMonth() + 1,
        tahun: new Date().getFullYear(),
    });
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const selectedReport = reportTypes.find((rt) => rt.value === reportType);

    const handlePreview = async () => {
        setIsLoading(true);
        setPreviewData(null);
        try {
            let url = '';
            const queryParams = new URLSearchParams(
                filters as Record<string, string>,
            ).toString();

            switch (reportType) {
                case 'stock_card':
                    if (!filters.item_id) {
                        toast.error('Pilih item terlebih dahulu');
                        setIsLoading(false);
                        return;
                    }
                    url = `/atk-reports/stock-card/${filters.item_id}`;
                    break;
                case 'monthly':
                    url = `/atk-reports/monthly?${queryParams}`;
                    break;
                case 'requests':
                    url = `/atk-reports/requests?${queryParams}`;
                    break;
                case 'purchases':
                    url = `/atk-reports/purchases?${queryParams}`;
                    break;
                case 'distributions':
                    url = `/atk-reports/distributions?${queryParams}`;
                    break;
                case 'low_stock':
                    url = '/atk-reports/low-stock';
                    break;
            }

            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setPreviewData(data);
            toast.success('Data preview berhasil dimuat');
        } catch (error) {
            toast.error('Gagal memuat data preview');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = (format: 'csv' | 'pdf') => {
        setIsExporting(true);
        try {
            let url = '';
            const queryParams = new URLSearchParams(
                filters as Record<string, string>,
            ).toString();

            switch (reportType) {
                case 'stock_card':
                    if (!filters.item_id) {
                        toast.error('Pilih item terlebih dahulu');
                        setIsExporting(false);
                        return;
                    }
                    url = stockCardPdf({ item: filters.item_id }).url;
                    if (queryParams) url += `?${queryParams}`;
                    break;
                case 'monthly':
                    if (format === 'pdf') {
                        url = monthlyPdf().url;
                    } else {
                        url = monthlyExcel().url;
                    }
                    if (queryParams) url += `?${queryParams}`;
                    break;
                case 'requests':
                    url = `/atk-reports/requests?${queryParams}`;
                    break;
                case 'purchases':
                    url = `/atk-reports/purchases?${queryParams}`;
                    break;
                case 'distributions':
                    url = `/atk-reports/distributions?${queryParams}`;
                    break;
                case 'low_stock':
                    url = '/atk-reports/low-stock';
                    break;
            }

            window.open(url, '_blank');
            toast.success('Laporan sedang diunduh');
        } catch (error) {
            toast.error('Gagal mengunduh laporan');
        } finally {
            setIsExporting(false);
        }
    };

    const renderPreviewTable = () => {
        if (!previewData) return null;

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
                                                col.includes('total'))
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

        if (previewData.mutations && previewData.mutations.length > 0) {
            const firstItem = previewData.mutations[0];
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
                        {previewData.mutations
                            .slice(0, 10)
                            .map((row: any, idx: number) => (
                                <TableRow key={idx}>
                                    {columns.map((col: string) => (
                                        <TableCell key={col}>
                                            {row[col]?.toString() || '-'}
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
            <Head title="Laporan ATK" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Laporan ATK
                    </h1>
                    <p className="text-muted-foreground">
                        Generate dan unduh berbagai laporan ATK dalam format CSV
                        atau PDF
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
                            value={reportType}
                            onValueChange={(value) => {
                                setReportType(value as ReportType);
                                setPreviewData(null);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis laporan" />
                            </SelectTrigger>
                            <SelectContent>
                                {reportTypes.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <div>
                                                <div className="font-medium">
                                                    {type.label}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {type.description}
                                                </div>
                                            </div>
                                            <div className="ml-auto rounded bg-muted px-2 py-1 text-xs">
                                                {type.format}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedReport && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <p className="text-sm font-medium">
                                    {selectedReport.label}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {selectedReport.description}
                                </p>
                                <div className="mt-2 text-xs">
                                    Format:{' '}
                                    <span className="font-semibold">
                                        {selectedReport.format}
                                    </span>
                                </div>
                            </div>
                        )}
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
                        {reportType === 'stock_card' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Pilih Item
                                </label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    value={filters.item_id || ''}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            item_id: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Pilih Item</option>
                                    {/* This should be populated from items list */}
                                    <option value="1">Kertas A4</option>
                                    <option value="2">Pulpen Hitam</option>
                                    <option value="3">Stapler</option>
                                </select>
                            </div>
                        )}

                        {reportType === 'monthly' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Bulan
                                    </label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        value={filters.bulan || ''}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                bulan: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="1">Januari</option>
                                        <option value="2">Februari</option>
                                        <option value="3">Maret</option>
                                        <option value="4">April</option>
                                        <option value="5">Mei</option>
                                        <option value="6">Juni</option>
                                        <option value="7">Juli</option>
                                        <option value="8">Agustus</option>
                                        <option value="9">September</option>
                                        <option value="10">Oktober</option>
                                        <option value="11">November</option>
                                        <option value="12">Desember</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Tahun
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        value={filters.tahun || ''}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                tahun: e.target.value,
                                            })
                                        }
                                        min="2020"
                                        max="2030"
                                    />
                                </div>
                            </div>
                        )}

                        {reportType === 'requests' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        value={filters.start_date || ''}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                start_date: e.target.value,
                                            })
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
                                        value={filters.end_date || ''}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                end_date: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {reportType === 'purchases' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        value={filters.start_date || ''}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                start_date: e.target.value,
                                            })
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
                                        value={filters.end_date || ''}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                end_date: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {reportType === 'low_stock' && (
                            <div className="rounded-lg border bg-yellow-50 p-4 dark:bg-yellow-950">
                                <div className="flex items-start gap-3">
                                    <TrendingDown className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                            Laporan Stok Menipis
                                        </p>
                                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                            Laporan ini menampilkan semua item
                                            ATK dengan stok di bawah stok
                                            minimal. Tidak perlu filter
                                            tambahan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handlePreview}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? (
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
                                    setFilters({});
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
                                        {selectedReport?.label} - Menampilkan{' '}
                                        {previewData.data?.length ||
                                            previewData.mutations?.length ||
                                            0}{' '}
                                        data
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {selectedReport?.format.includes('PDF') && (
                                        <Button
                                            onClick={() => handleExport('pdf')}
                                            disabled={isExporting}
                                            variant="default"
                                            size="sm"
                                        >
                                            {isExporting ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                    Mendownload...
                                                </>
                                            ) : (
                                                <>
                                                    <FileDown className="mr-2 h-4 w-4" />
                                                    Export PDF
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {selectedReport?.format.includes('CSV') && (
                                        <Button
                                            onClick={() => handleExport('csv')}
                                            disabled={isExporting}
                                            variant="default"
                                            size="sm"
                                        >
                                            {isExporting ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                    Mendownload...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Export CSV
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
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
