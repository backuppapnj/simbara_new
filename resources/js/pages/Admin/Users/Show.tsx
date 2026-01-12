import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Pencil, Shield, Trash2, UserCog, LogIn } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    nip: string | null;
    position: string | null;
    department: string | null;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    roles: Array<{ id: number; name: string }>;
}

interface ShowProps {
    user: User;
    roles: Role[];
}

const roleDisplayNames: Record<string, string> = {
    super_admin: 'Super Admin',
    kpa: 'KPA',
    kasubag_umum: 'Kasubag Umum',
    pegawai: 'Pegawai',
    operator_bmn: 'Operator BMN',
    operator_atk: 'Operator ATK',
};

export default function UserShow({ user, roles }: ShowProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isImpersonating, setIsImpersonating] = useState(false);

    const deleteForm = useForm({});

    const handleDelete = () => {
        deleteForm.delete(`/admin/users/${user.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                router.visit('/admin/users');
            },
        });
    };

    const handleRestore = () => {
        router.post(`/admin/users/${user.id}/restore`, {}, {
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const handleImpersonate = () => {
        setIsImpersonating(true);
        router.post(`/admin/users/${user.id}/impersonate`, {}, {
            onFinish: () => setIsImpersonating(false),
        });
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Users',
            href: '/admin/users',
        },
        {
            title: user.name,
            href: `/admin/users/${user.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - User Details`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">User Details</h1>
                        <p className="text-sm text-muted-foreground">
                            View and manage user information
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {user.deleted_at ? (
                            <Button onClick={handleRestore} variant="outline">
                                <Shield className="mr-2 h-4 w-4" />
                                Restore User
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={handleImpersonate}
                                    variant="secondary"
                                    disabled={isImpersonating}
                                >
                                    <LogIn className="mr-2 h-4 w-4" />
                                    {isImpersonating ? 'Impersonating...' : 'Impersonate'}
                                </Button>
                                <Link href={`/admin/users/${user.id}/edit`}>
                                    <Button variant="outline">
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* User Info Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar and Basic Info */}
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl text-primary-foreground">
                                    {getInitials(user.name)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        {user.email_verified_at && (
                                            <Badge variant="outline" className="gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <p className="font-medium">{user.phone || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">NIP</Label>
                                    <p className="font-medium">{user.nip || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Position</Label>
                                    <p className="font-medium">{user.position || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Department</Label>
                                    <p className="font-medium">{user.department || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Created At</Label>
                                    <p className="font-medium">{formatDate(user.created_at)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Updated At</Label>
                                    <p className="font-medium">{formatDate(user.updated_at)}</p>
                                </div>
                                {user.deleted_at && (
                                    <div>
                                        <Label className="text-muted-foreground text-destructive">
                                            Deleted At
                                        </Label>
                                        <p className="font-medium text-destructive">
                                            {formatDate(user.deleted_at)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Roles Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="h-5 w-5" />
                                Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {user.roles.length > 0 ? (
                                    user.roles.map((role) => (
                                        <Badge key={role.id} variant="secondary" className="w-full justify-start py-2">
                                            {roleDisplayNames[role.name] || role.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No roles assigned</p>
                                )}
                            </div>

                            <div className="mt-4">
                                <Link href={`/admin/users/${user.id}/edit`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Manage Roles
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{user.name}</strong>? This action will
                            soft delete the user and they will be unable to access the system. You can
                            restore the user later if needed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || deleteForm.processing}>
                            {isDeleting || deleteForm.processing ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
