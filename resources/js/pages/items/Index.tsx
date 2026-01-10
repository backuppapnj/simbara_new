import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Items',
        href: '/items',
    },
];

interface Item {
    id: string;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    kategori: string | null;
    stok: number;
    stok_minimal: number;
    stok_maksimal: number;
    harga_beli_terakhir: number | null;
    harga_rata_rata: number | null;
    harga_jual: number | null;
}

interface ItemsProps {
    items: {
        data: Item[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
        kategori: string;
    };
}

export default function ItemsIndex({ items, filters }: ItemsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Items" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Master Data ATK</h1>
                </div>

                <div className="rounded-lg border p-6">
                    <p className="text-muted-foreground">
                        Items page loaded successfully. Found {items.total} items.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
