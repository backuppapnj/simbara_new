import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, ShoppingCart, Wrench } from 'lucide-react';

interface QuickAction {
    label: string;
    icon: typeof Package;
    href: string;
    description: string;
}

const quickActions: QuickAction[] = [
    {
        label: 'Kelola Aset',
        icon: Package,
        href: '#',
        description: 'Lihat dan kelola aset perusahaan',
    },
    {
        label: 'Kelola ATK',
        icon: FileText,
        href: '#',
        description: 'Kelola stok alat tulis kantor',
    },
    {
        label: 'Permintaan',
        icon: ShoppingCart,
        href: '#',
        description: 'Kelola permintaan barang',
    },
    {
        label: 'Pemeliharaan',
        icon: Wrench,
        href: '#',
        description: 'Jadwal dan riwayat pemeliharaan',
    },
];

export default function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.label}
                                variant="outline"
                                className="flex h-auto flex-col items-start gap-2 p-4 text-left"
                                asChild
                            >
                                <a href={action.href}>
                                    <Icon className="size-5 text-muted-foreground" />
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold">
                                            {action.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {action.description}
                                        </span>
                                    </div>
                                </a>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
