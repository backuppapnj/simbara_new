import { DataTable, type Column } from '@/components/enhanced/data-table';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
    id: string;
    nama_ruangan: string;
    gedung: string | null;
    lantai: number | null;
}

interface Asset {
    id: string;
    kd_brg: string | null;
    nama: string | null;
    ur_kondisi: string | null;
    kd_kondisi: string | null;
    rph_aset: number | null;
    location: Location | null;
}

interface AssetTableProps {
    assets: Asset[];
    isLoading?: boolean;
    onRowClick?: (asset: Asset) => void;
}

const conditionColors: Record<string, string> = {
    '1': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
    '2': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800',
    '3': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800',
};

const formatRupiah = (value: number | null): string => {
    if (value === null) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const columns: Column<Asset>[] = [
    {
        id: 'kd_brg',
        header: 'Kode Barang',
        accessor: 'kd_brg',
        sortable: true,
        className: 'font-mono text-xs',
    },
    {
        id: 'nama',
        header: 'Nama Aset',
        accessor: 'nama',
        sortable: true,
        cell: (asset) => (
            <div className="max-w-md">
                <div className="font-medium truncate">{asset.nama || '-'}</div>
                {asset.merk && (
                    <div className="text-xs text-muted-foreground truncate">{asset.merk}</div>
                )}
            </div>
        ),
    },
    {
        id: 'location',
        header: 'Lokasi',
        accessor: 'location',
        cell: (asset) => {
            if (!asset.location) {
                return <span className="text-muted-foreground">{asset.lokasi_ruang || '-'}</span>;
            }

            return (
                <div className="text-sm">
                    <div className="font-medium">{asset.location.nama_ruangan}</div>
                    {asset.location.gedung && (
                        <div className="text-xs text-muted-foreground">
                            {asset.location.gedung}
                            {asset.location.lantai !== null && ` - Lantai ${asset.location.lantai}`}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        id: 'kd_kondisi',
        header: 'Kondisi',
        accessor: 'kd_kondisi',
        sortable: true,
        cell: (asset) => {
            if (!asset.kd_kondisi) return <span className="text-muted-foreground">-</span>;

            const colorClass = conditionColors[asset.kd_kondisi] || 'bg-gray-100 text-gray-800 border-gray-200';

            return (
                <Badge variant="outline" className={cn('font-normal', colorClass)}>
                    {asset.ur_kondisi || asset.kd_kondisi}
                </Badge>
            );
        },
    },
    {
        id: 'rph_aset',
        header: 'Nilai Aset',
        accessor: 'rph_aset',
        sortable: true,
        cell: (asset) => (
            <span className="font-medium tabular-nums">{formatRupiah(asset.rph_aset)}</span>
        ),
    },
    {
        id: 'actions',
        header: 'Aksi',
        accessor: 'id',
        cell: (asset) => (
            <Link
                href={route('assets.show', asset.id)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Lihat Detail</span>
            </Link>
        ),
        className: 'w-[70px] text-center',
    },
];

export default function AssetTable({ assets, isLoading, onRowClick }: AssetTableProps) {
    return (
        <DataTable
            data={assets}
            columns={columns}
            isLoading={isLoading}
            searchable={false}
            exportable={false}
            pagination={false}
            emptyMessage="Tidak ada aset yang ditemukan"
            onRowClick={onRowClick}
            pageSize={50}
        />
    );
}
