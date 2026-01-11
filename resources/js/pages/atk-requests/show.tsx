import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building,
    Calendar,
    CheckCircle,
    FileText,
    Package,
    User,
    XCircle,
} from 'lucide-react';

interface RequestDetail {
    id: string;
    item_id: string;
    item?: {
        id: string;
        nama_barang: string;
        kode_barang: string;
        satuan: string;
        stok: number;
    };
    jumlah_diminta: number;
    jumlah_disetujui: number | null;
    jumlah_diberikan: number | null;
}

interface AtkRequestData {
    id: string;
    no_permintaan: string;
    user_id: string;
    department_id: string;
    tanggal: string;
    status: string;
    level1_approval_by: string | null;
    level1_approval_at: string | null;
    level2_approval_by: string | null;
    level2_approval_at: string | null;
    level3_approval_by: string | null;
    level3_approval_at: string | null;
    distributed_by: string | null;
    distributed_at: string | null;
    received_at: string | null;
    keterangan: string | null;
    alasan_penolakan: string | null;
    user?: {
        id: string;
        name: string;
    };
    department?: {
        id: string;
        name: string;
    };
    level1_approver?: {
        id: string;
        name: string;
    } | null;
    level2_approver?: {
        id: string;
        name: string;
    } | null;
    level3_approver?: {
        id: string;
        name: string;
    } | null;
    distributed_by_user?: {
        id: string;
        name: string;
    } | null;
    request_details?: RequestDetail[];
}

interface ShowProps {
    atkRequest: AtkRequestData;
    can: {
        approve_level1: boolean;
        approve_level2: boolean;
        approve_level3: boolean;
        distribute: boolean;
        confirm_receive: boolean;
    };
}

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
        label: 'Pending',
        className:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-800',
    },
    level1_approved: {
        label: 'Approved L1',
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-800',
    },
    level2_approved: {
        label: 'Approved L2',
        className:
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-800',
    },
    level3_approved: {
        label: 'Approved L3',
        className:
            'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-800',
    },
    rejected: {
        label: 'Rejected',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-800',
    },
    diserahkan: {
        label: 'Diserahkan',
        className:
            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-800',
    },
    diterima: {
        label: 'Diterima',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-800',
    },
};

const statusSteps = [
    { key: 'pending', label: 'Pending', level: 0 },
    { key: 'level1_approved', label: 'Level 1', level: 1 },
    { key: 'level2_approved', label: 'Level 2', level: 2 },
    { key: 'level3_approved', label: 'Level 3', level: 3 },
    { key: 'diserahkan', label: 'Diserahkan', level: 4 },
    { key: 'diterima', label: 'Diterima', level: 5 },
];

export default function AtkRequestsShow({ atkRequest, can }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Permintaan ATK',
            href: '/atk-requests',
        },
        {
            title: atkRequest.no_permintaan,
            href: `/atk-requests/${atkRequest.id}`,
        },
    ];

    const rejectForm = useForm({
        alasan_penolakan: '',
    });

    const distributeForm = useForm({
        items: atkRequest.request_details?.map((detail) => ({
            detail_id: detail.id,
            jumlah_diberikan:
                detail.jumlah_disetujui ?? detail.jumlah_diminta,
        })) ?? [],
    });

    const handleReject = () => {
        rejectForm.post(route('atk-requests.reject', atkRequest.id), {
            onFinish: () => {
                (
                    document.querySelector(
                        '[data-dialog-close]',
                    ) as HTMLButtonElement
                )?.click();
            },
        });
    };

    const handleDistribute = () => {
        distributeForm.post(route('atk-requests.distribute', atkRequest.id), {
            onSuccess: () => {
                (
                    document.querySelector(
                        '[data-dialog-close]',
                    ) as HTMLButtonElement
                )?.click();
            },
        });
    };

    const handleApprove = (level: number) => {
        const routeName = `atk-requests.approve-level${level}` as const;
        router.post(route(routeName, atkRequest.id));
    };

    const handleConfirmReceive = () => {
        router.post(route('atk-requests.confirm-receive', atkRequest.id));
    };

    const canApproveLevel1 =
        can.approve_level1 && atkRequest.status === 'pending';
    const canApproveLevel2 =
        can.approve_level2 && atkRequest.status === 'level1_approved';
    const canApproveLevel3 =
        can.approve_level3 && atkRequest.status === 'level2_approved';
    const canReject =
        (can.approve_level1 || can.approve_level2 || can.approve_level3) &&
        ['pending', 'level1_approved', 'level2_approved'].includes(
            atkRequest.status,
        );
    const canDistribute =
        can.distribute && atkRequest.status === 'level3_approved';
    const canConfirm =
        can.confirm_receive && atkRequest.status === 'diserahkan';

    const getCurrentStatusIndex = () => {
        if (atkRequest.status === 'rejected') return -1;
        const index = statusSteps.findIndex(
            (step) => step.key === atkRequest.status,
        );
        return index >= 0 ? index : 0;
    };

    const currentStatusIndex = getCurrentStatusIndex();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Permintaan ${atkRequest.no_permintaan}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('atk-requests.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {atkRequest.no_permintaan}
                            </h1>
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={
                                        statusConfig[atkRequest.status]
                                            ?.className
                                    }
                                >
                                    {statusConfig[atkRequest.status]?.label ||
                                        atkRequest.status}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        atkRequest.tanggal,
                                    ).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {canApproveLevel1 && (
                            <Button
                                onClick={() => handleApprove(1)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve L1
                            </Button>
                        )}
                        {canApproveLevel2 && (
                            <Button
                                onClick={() => handleApprove(2)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve L2
                            </Button>
                        )}
                        {canApproveLevel3 && (
                            <Button
                                onClick={() => handleApprove(3)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve L3
                            </Button>
                        )}
                        {canReject && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Tolak Permintaan
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="alasan_penolakan">
                                                Alasan Penolakan
                                            </Label>
                                            <Textarea
                                                id="alasan_penolakan"
                                                value={
                                                    rejectForm.data
                                                        .alasan_penolakan
                                                }
                                                onChange={(e) =>
                                                    rejectForm.setData(
                                                        'alasan_penolakan',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan alasan penolakan..."
                                                rows={4}
                                            />
                                            {rejectForm.errors
                                                .alasan_penolakan && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {
                                                        rejectForm.errors
                                                            .alasan_penolakan
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    rejectForm.reset()
                                                }
                                                data-dialog-close
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleReject}
                                                disabled={rejectForm.processing}
                                            >
                                                {rejectForm.processing
                                                    ? 'Memproses...'
                                                    : 'Tolak'}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                        {canDistribute && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-orange-600 hover:bg-orange-700">
                                        <Package className="mr-2 h-4 w-4" />
                                        Serahkan Barang
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Distribusikan Barang
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            {atkRequest.request_details?.map(
                                                (detail, index) => (
                                                    <div
                                                        key={detail.id}
                                                        className="flex items-center gap-4 rounded-lg border p-3"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium">
                                                                {
                                                                    detail.item
                                                                        ?.nama_barang
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Diminta:{' '}
                                                                {
                                                                    detail.jumlah_diminta
                                                                }
                                                                , Disetujui:{' '}
                                                                {detail.jumlah_disetujui ??
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                        <div className="w-32">
                                                            <Label
                                                                htmlFor={`jumlah-${detail.id}`}
                                                                className="text-xs"
                                                            >
                                                                Jumlah
                                                                Diberikan
                                                            </Label>
                                                            <Input
                                                                id={`jumlah-${detail.id}`}
                                                                type="number"
                                                                min={0}
                                                                max={
                                                                    detail.jumlah_disetujui ??
                                                                    detail.jumlah_diminta
                                                                }
                                                                value={
                                                                    distributeForm
                                                                        .data.items[
                                                                        index
                                                                    ]
                                                                        ?.jumlah_diberikan
                                                                }
                                                                onChange={(e) =>
                                                                    distributeForm.setData(
                                                                        `items.${index}.jumlah_diberikan`,
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                className="mt-1"
                                                            />
                                                            {distributeForm
                                                                .errors[
                                                                    `items.${index}.jumlah_diberikan`
                                                                ] && (
                                                                <p className="mt-1 text-xs text-red-600">
                                                                    {
                                                                        distributeForm
                                                                            .errors[
                                                                            `items.${index}.jumlah_diberikan`
                                                                        ]
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        {distributeForm.errors.items && (
                                            <p className="text-sm text-red-600">
                                                {
                                                    distributeForm.errors
                                                        .items
                                                }
                                            </p>
                                        )}
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    distributeForm.reset()
                                                }
                                                data-dialog-close
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                className="bg-orange-600 hover:bg-orange-700"
                                                onClick={handleDistribute}
                                                disabled={
                                                    distributeForm.processing
                                                }
                                            >
                                                {distributeForm.processing
                                                    ? 'Memproses...'
                                                    : 'Serahkan'}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Status Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            {statusSteps.map((step, index) => {
                                const isCompleted =
                                    index <= currentStatusIndex &&
                                    currentStatusIndex >= 0;
                                const isCurrent = index === currentStatusIndex;
                                const isRejected =
                                    atkRequest.status === 'rejected';

                                let approver = null;
                                let approvedAt = null;

                                if (step.key === 'level1_approved') {
                                    approver = atkRequest.level1_approver;
                                    approvedAt = atkRequest.level1_approval_at;
                                } else if (step.key === 'level2_approved') {
                                    approver = atkRequest.level2_approver;
                                    approvedAt = atkRequest.level2_approval_at;
                                } else if (step.key === 'level3_approved') {
                                    approver = atkRequest.level3_approver;
                                    approvedAt = atkRequest.level3_approval_at;
                                } else if (step.key === 'diserahkan') {
                                    approver = atkRequest.distributed_by_user;
                                    approvedAt = atkRequest.distributed_at;
                                } else if (step.key === 'diterima') {
                                    approvedAt = atkRequest.received_at;
                                }

                                return (
                                    <div
                                        key={step.key}
                                        className="flex flex-col items-center"
                                    >
                                        <div
                                            className={cn(
                                                'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold',
                                                isRejected
                                                    ? 'border-red-500 bg-red-500 text-white'
                                                    : isCompleted
                                                      ? 'border-green-500 bg-green-500 text-white'
                                                      : isCurrent
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-muted bg-background text-muted-foreground',
                                            )}
                                        >
                                            {isRejected ? (
                                                <XCircle className="h-5 w-5" />
                                            ) : isCompleted || isCurrent ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p className="text-xs font-medium">
                                                {step.label}
                                            </p>
                                            {approver && (
                                                <p className="text-xs text-muted-foreground">
                                                    {approver.name}
                                                </p>
                                            )}
                                            {approvedAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        approvedAt,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        {index < statusSteps.length - 1 && (
                                            <div
                                                className={cn(
                                                    'h-1 w-20',
                                                    index < currentStatusIndex
                                                        ? 'bg-green-500'
                                                        : 'bg-muted',
                                                )}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Request Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informasi Permintaan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Pemohon
                                    </p>
                                    <p className="font-medium">
                                        {atkRequest.user?.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Departemen
                                    </p>
                                    <p className="font-medium">
                                        {atkRequest.department?.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Tanggal
                                    </p>
                                    <p className="font-medium">
                                        {new Date(
                                            atkRequest.tanggal,
                                        ).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                            {atkRequest.keterangan && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Keterangan
                                    </p>
                                    <p className="font-medium">
                                        {atkRequest.keterangan}
                                    </p>
                                </div>
                            )}
                            {atkRequest.alasan_penolakan && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                        Alasan Penolakan
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-300">
                                        {atkRequest.alasan_penolakan}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Daftar Barang
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {atkRequest.request_details?.map((detail) => (
                                    <div
                                        key={detail.id}
                                        className="flex items-start justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {detail.item?.nama_barang}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {detail.item?.kode_barang}
                                            </p>
                                        </div>
                                        <div className="ml-4 text-right">
                                            <p className="font-medium">
                                                {detail.jumlah_diminta}{' '}
                                                {detail.item?.satuan}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Diminta
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Confirm Receive Button */}
                {canConfirm && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="font-medium text-green-900 dark:text-green-100">
                                    Barang Siap Diterima
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Konfirmasi bahwa Anda telah menerima barang
                                    yang diminta
                                </p>
                            </div>
                            <Button
                                onClick={handleConfirmReceive}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Konfirmasi Penerimaan
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
