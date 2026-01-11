import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Office Supplies',
        href: '/office-supplies',
    },
    {
        title: 'Mutations',
        href: '',
    },
];

interface Mutation {
    id: string;
    jenis_mutasi: string;
    jumlah: number;
    stok_sebelum: number;
    stok_sesudah: number;
    keterangan: string | null;
    created_at: string;
}

interface Supply {
    id: string;
    nama_barang: string;
    satuan: string;
    stok: number;
}

interface MutationsProps {
    supply: Supply;
    mutations: {
        data: Mutation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        jenis: string;
    };
}

export default function OfficeSupplyMutations({
    supply,
    mutations,
    filters,
}: MutationsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Mutasi - ${supply.nama_barang}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href="/office-supplies">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Mutasi Stok</h1>
                        <p className="text-muted-foreground">
                            {supply.nama_barang}
                        </p>
                    </div>
                </div>

                <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {mutations.total} mutasi
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
