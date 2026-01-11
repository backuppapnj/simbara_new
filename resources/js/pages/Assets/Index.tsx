import AssetCard from '@/components/assets/AssetCard';
import AssetTable from '@/components/assets/AssetTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import assets from '@/routes/assets';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Search, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface FilterOptions {
    locations: Location[];
    kondisi: Array<{ value: string; label: string }>;
    status: Array<{ value: string; label: string }>;
}

interface IndexProps {
    assets: {
        data: Asset[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: {
        search?: string;
        kondisi?: string;
        lokasi?: string;
        status?: string;
        sort?: string;
        direction?: string;
    };
    filterOptions: FilterOptions;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Aset BMN',
        href: '/assets',
    },
];

export default function AssetsIndex({
    assets,
    filters,
    filterOptions,
}: IndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedKondisi, setSelectedKondisi] = useState(
        filters.kondisi || '',
    );
    const [selectedLokasi, setSelectedLokasi] = useState(filters.lokasi || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const applyFilters = () => {
        const params: Record<string, string | undefined> = {
            search: searchQuery || undefined,
            kondisi: selectedKondisi || undefined,
            lokasi: selectedLokasi || undefined,
            status: selectedStatus || undefined,
        };

        router.get(assets.index.url(), params, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedKondisi('');
        setSelectedLokasi('');
        setSelectedStatus('');

        router.get(
            assets.index.url(),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters =
        searchQuery || selectedKondisi || selectedLokasi || selectedStatus;

    const handlePageChange = (page: number) => {
        const params: Record<string, string | number | undefined> = {
            search: searchQuery || undefined,
            kondisi: selectedKondisi || undefined,
            lokasi: selectedLokasi || undefined,
            status: selectedStatus || undefined,
            page,
        };

        router.get(assets.index.url(), params, {
            preserveState: true,
            only: ['assets'],
        });
    };

    const renderPagination = () => {
        if (assets.last_page <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(
            1,
            assets.current_page - Math.floor(maxVisible / 2),
        );
        const endPage = Math.min(assets.last_page, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {assets.from && assets.to ? (
                        <>
                            Menampilkan {assets.from} sampai {assets.to} dari{' '}
                            {assets.total} aset
                        </>
                    ) : (
                        <>Total {assets.total} aset</>
                    )}
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() =>
                                    handlePageChange(assets.current_page - 1)
                                }
                                className={
                                    assets.current_page === 1
                                        ? 'pointer-events-none opacity-50'
                                        : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>

                        {startPage > 1 && (
                            <>
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => handlePageChange(1)}
                                        className="cursor-pointer"
                                    >
                                        1
                                    </PaginationLink>
                                </PaginationItem>
                                {startPage > 2 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                            </>
                        )}

                        {pages.map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={page === assets.current_page}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        {endPage < assets.last_page && (
                            <>
                                {endPage < assets.last_page - 1 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() =>
                                            handlePageChange(assets.last_page)
                                        }
                                        className="cursor-pointer"
                                    >
                                        {assets.last_page}
                                    </PaginationLink>
                                </PaginationItem>
                            </>
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() =>
                                    handlePageChange(assets.current_page + 1)
                                }
                                className={
                                    assets.current_page === assets.last_page
                                        ? 'pointer-events-none opacity-50'
                                        : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Aset BMN" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Aset BMN</h1>
                        <p className="text-muted-foreground">
                            Kelola aset barang milik negara
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={assets.reports.index.url()}>
                            <Button variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                Laporan
                            </Button>
                        </Link>
                        <Link href={assets.importMethod.url()}>
                            <Button size="sm">
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Filter & Pencarian</h3>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label htmlFor="search">Cari Aset</Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Nama atau kode barang..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter by Location */}
                        <div className="space-y-2">
                            <Label htmlFor="lokasi">Lokasi</Label>
                            <Select
                                value={selectedLokasi}
                                onValueChange={setSelectedLokasi}
                            >
                                <SelectTrigger id="lokasi">
                                    <SelectValue placeholder="Semua lokasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">
                                        Semua lokasi
                                    </SelectItem>
                                    {filterOptions.locations.map((location) => (
                                        <SelectItem
                                            key={location.id}
                                            value={location.id}
                                        >
                                            {location.nama_ruangan}
                                            {location.gedung &&
                                                ` - ${location.gedung}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter by Condition */}
                        <div className="space-y-2">
                            <Label htmlFor="kondisi">Kondisi</Label>
                            <Select
                                value={selectedKondisi}
                                onValueChange={setSelectedKondisi}
                            >
                                <SelectTrigger id="kondisi">
                                    <SelectValue placeholder="Semua kondisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">
                                        Semua kondisi
                                    </SelectItem>
                                    {filterOptions.kondisi.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter by Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={selectedStatus}
                                onValueChange={setSelectedStatus}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">
                                        Semua status
                                    </SelectItem>
                                    {filterOptions.status.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                        {assets.total === 0
                            ? 'Tidak ada aset yang ditemukan'
                            : `Menampilkan ${assets.data.length} dari ${assets.total} aset`}
                    </p>
                </div>

                {/* Assets Display */}
                {assets.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center">
                        <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                            Tidak ada aset ditemukan
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Coba sesuaikan filter atau kata kunci pencarian Anda
                        </p>
                        {hasActiveFilters && (
                            <Button onClick={clearFilters} variant="outline">
                                <X className="mr-2 h-4 w-4" />
                                Hapus Semua Filter
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Table View - Desktop */}
                        <div className="hidden md:block">
                            <AssetTable assets={assets.data} />
                        </div>

                        {/* Card View - Mobile */}
                        <div className="grid gap-4 sm:grid-cols-2 md:hidden">
                            {assets.data.map((asset) => (
                                <AssetCard key={asset.id} asset={asset} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {renderPagination()}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
