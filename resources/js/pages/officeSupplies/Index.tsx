import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Office Supplies',
        href: '/office-supplies',
    },
];

interface Supply {
    id: string;
    nama_barang: string;
    satuan: string;
    kategori: string;
    stok: number;
    stok_minimal: number;
}

interface IndexProps {
    supplies: {
        data: Supply[];
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

export default function OfficeSuppliesIndex({ supplies, filters }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bahan Keperluan Kantor" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Bahan Keperluan Kantor</h1>
                    <p className="text-muted-foreground">Kelola bahan keperluan kantor</p>
                </div>

                <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {supplies.total} item
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
