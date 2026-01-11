import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { MapPin, Package, DollarSign, ChevronRight } from 'lucide-react';
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
    merk: string | null;
    ur_kondisi: string | null;
    kd_kondisi: string | null;
    rph_aset: number | null;
    lokasi_ruang: string | null;
    location: Location | null;
}

interface AssetCardProps {
    asset: Asset;
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

const getLocationDisplay = (asset: Asset): string => {
    if (asset.location) {
        let location = asset.location.nama_ruangan;
        if (asset.location.gedung) {
            location += `, ${asset.location.gedung}`;
            if (asset.location.lantai !== null) {
                location += ` - Lt. ${asset.location.lantai}`;
            }
        }
        return location;
    }
    return asset.lokasi_ruang || '-';
};

export default function AssetCard({ asset }: AssetCardProps) {
    return (
        <Link
            href={route('assets.show', asset.id)}
            className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-2">{asset.nama || 'Tanpa Nama'}</CardTitle>
                            {asset.kd_brg && (
                                <p className="text-xs text-muted-foreground font-mono mt-1">{asset.kd_brg}</p>
                            )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Location */}
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm line-clamp-2">{getLocationDisplay(asset)}</span>
                    </div>

                    {/* Condition */}
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        {asset.kd_kondisi ? (
                            <Badge
                                variant="outline"
                                className={cn('font-normal', conditionColors[asset.kd_kondisi])}
                            >
                                {asset.ur_kondisi || asset.kd_kondisi}
                            </Badge>
                        ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                        )}
                    </div>

                    {/* Value */}
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium tabular-nums">
                            {formatRupiah(asset.rph_aset)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
