import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Office Usages',
        href: '/office-usages',
    },
];

interface Usage {
    id: string;
    jumlah: number;
    tanggal: string;
    keperluan: string | null;
    created_at: string;
    supply: {
        id: string;
        nama_barang: string;
        satuan: string;
    };
    user: {
        id: string;
        name: string;
    };
}

interface IndexProps {
    usages: {
        data: Usage[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        date_from: string | null;
        date_to: string | null;
    };
}

export default function OfficeUsagesIndex({ usages, filters }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemakaian Bahan Kantor" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Pemakaian Bahan Kantor</h1>
                    <p className="text-muted-foreground">Riwayat pemakaian bahan kantor</p>
                </div>

                <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {usages.total} catatan pemakaian
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
