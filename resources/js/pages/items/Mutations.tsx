import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Items',
        href: '/items',
    },
    {
        title: 'Mutations',
        href: '',
    },
];

interface StockMutation {
    id: string;
    jenis_mutasi: string;
    jumlah: number;
    stok_sebelum: number;
    stok_sesudah: number;
    keterangan: string | null;
    created_at: string;
}

interface Item {
    id: string;
    kode_barang: string;
    nama_barang: string;
    satuan: string;
    stok: number;
}

interface MutationsProps {
    item: Item;
    mutations: {
        data: StockMutation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        jenis: string;
    };
}

export default function ItemMutations({ item, mutations, filters }: MutationsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kartu Stok - ${item.nama_barang}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Kartu Stok</h1>
                        <p className="text-muted-foreground">{item.nama_barang}</p>
                    </div>
                </div>

                <div className="rounded-lg border p-6">
                    <p className="text-muted-foreground">
                        Stock mutations loaded successfully. Found {mutations.total} mutations.
                    </p>
                    <p className="mt-2 text-muted-foreground">
                        Current stock: {item.stok} {item.satuan}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
