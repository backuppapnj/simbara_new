import PermissionList from '@/components/Admin/Roles/PermissionList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import roles from '@/routes/admin/roles';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Save,
    Search,
    Shield,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type TabValue = 'users' | 'permissions';

interface User {
    id: number;
    name: string;
    email: string;
    nip?: string;
    has_role: boolean;
}

interface Role {
    id: number;
    name: string;
    users_count: number;
    permissions_count?: number;
}

interface Permission {
    id: number;
    name: string;
    module: string;
    description: string | null;
    assigned: boolean;
    created_at: string;
    updated_at: string;
}

interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    search?: string;
    is_active?: string;
    tab?: string;
}

interface ShowProps {
    role: Role;
    users: PaginatedUsers;
    permissions?: {
        groups: PermissionGroup[];
        all: Permission[];
    };
    filters: Filters;
}

export default function RoleShow({
    role,
    users,
    permissions,
    filters,
}: ShowProps) {
    const { props } = usePage();
    const [activeTab, setActiveTab] = useState<TabValue>(
        (filters.tab as TabValue) || 'users',
    );
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
        users.data.filter((u) => u.has_role).map((u) => u.id),
    );
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<
        number[]
    >(permissions?.all.filter((p) => p.assigned).map((p) => p.id) || []);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [usersToRemove, setUsersToRemove] = useState<number[]>([]);

    // Initialize form with Inertia's useForm
    const form = useForm({
        user_ids: selectedUserIds,
        permission_ids: selectedPermissionIds,
    });

    // Update form when selection changes
    useEffect(() => {
        form.setData('user_ids', selectedUserIds);
    }, [selectedUserIds]);

    useEffect(() => {
        form.setData('permission_ids', selectedPermissionIds);
    }, [selectedPermissionIds]);

    // Handle tab change
    const handleTabChange = (tab: TabValue) => {
        setActiveTab(tab);
        router.get(
            roles.show.url(role.id),
            { ...filters, tab },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Handle search debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                roles.show.url(role.id),
                { ...filters, tab: activeTab, search: searchQuery },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle checkbox toggle with confirmation for removal
    const handleToggleUser = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUserIds((prev) => [...prev, userId]);
        } else {
            // Show confirmation dialog when removing role
            setUsersToRemove([userId]);
            setShowConfirmDialog(true);
        }
    };

    // Handle select all with confirmation
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = users.data.map((u) => u.id);
            setSelectedUserIds(allIds);
        } else {
            // Calculate which users will be removed
            const usersToDeselect = users.data.filter((u) =>
                selectedUserIds.includes(u.id),
            );
            if (usersToDeselect.length > 0) {
                setUsersToRemove(usersToDeselect.map((u) => u.id));
                setShowConfirmDialog(true);
            }
        }
    };

    // Confirm removal dialog handler
    const handleConfirmRemoval = () => {
        const newSelection = selectedUserIds.filter(
            (id) => !usersToRemove.includes(id),
        );
        setSelectedUserIds(newSelection);
        setShowConfirmDialog(false);
        setUsersToRemove([]);
    };

    // Cancel removal dialog handler
    const handleCancelRemoval = () => {
        setShowConfirmDialog(false);
        setUsersToRemove([]);
    };

    // Handle permission toggle
    const handleTogglePermission = (permissionId: number, checked: boolean) => {
        if (checked) {
            setSelectedPermissionIds((prev) => [...prev, permissionId]);
        } else {
            setSelectedPermissionIds((prev) =>
                prev.filter((id) => id !== permissionId),
            );
        }
    };

    // Handle module toggle
    const handleToggleModule = (module: string, checked: boolean) => {
        if (!permissions) return;

        const modulePermissions = permissions.groups.find(
            (g) => g.module === module,
        )?.permissions;

        if (!modulePermissions) return;

        if (checked) {
            const moduleIds = modulePermissions.map((p) => p.id);
            setSelectedPermissionIds((prev) => [
                ...new Set([...prev, ...moduleIds]),
            ]);
        } else {
            const moduleIds = modulePermissions.map((p) => p.id);
            setSelectedPermissionIds((prev) =>
                prev.filter((id) => !moduleIds.includes(id)),
            );
        }
    };

    // Check if all users on current page are selected
    const allSelected =
        users.data.length > 0 &&
        users.data.every((u) => selectedUserIds.includes(u.id));
    const someSelected = users.data.some((u) => selectedUserIds.includes(u.id));

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const updateUrl =
            activeTab === 'users'
                ? roles.updateUsers.url(role.id)
                : roles.syncPermissions.url(role.id);

        form.put(updateUrl, {
            onSuccess: () => {
                const tabName = activeTab === 'users' ? 'User' : 'Permission';
                setToastMessage(`${tabName} assignments updated successfully!`);
                setShowSuccessToast(true);
                setIsLoading(false);
                setTimeout(() => setShowSuccessToast(false), 3000);
            },
            onError: (errors) => {
                setToastMessage(Object.values(errors).join(', '));
                setShowSuccessToast(true);
                setIsLoading(false);
                setTimeout(() => setShowSuccessToast(false), 3000);
            },
        });
    };

    // Skeleton loader for user rows
    function UserRowSkeleton() {
        return (
            <div
                className="flex animate-pulse items-center space-x-3 rounded-md border p-3"
                aria-hidden="true"
            >
                <div className="h-4 w-4 rounded bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-48 rounded bg-muted" />
                </div>
            </div>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin/roles',
        },
        {
            title: 'Roles',
            href: roles.index.url(),
        },
        {
            title: role.name,
            href: '',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${role.name} Role`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={roles.index.url()}
                            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Button variant="ghost" size="sm">
                                <ArrowLeft
                                    className="mr-2 h-4 w-4"
                                    aria-hidden="true"
                                />
                                <span>Back to Roles</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Role: {role.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage users and permissions for this role
                            </p>
                        </div>
                    </div>
                </div>

                {/* Role Summary Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                    <span>{role.name}</span>
                                </CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <Users
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        {role.users_count} user
                                        {role.users_count !== 1 ? 's' : ''}{' '}
                                        assigned
                                    </span>
                                    {role.permissions_count !== undefined && (
                                        <span className="flex items-center gap-1.5">
                                            <Shield
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                            {role.permissions_count} permission
                                            {role.permissions_count !== 1
                                                ? 's'
                                                : ''}
                                        </span>
                                    )}
                                </CardDescription>
                            </div>
                            <Badge
                                variant="secondary"
                                className="text-sm"
                                aria-label={`${
                                    activeTab === 'users'
                                        ? selectedUserIds.length
                                        : selectedPermissionIds.length
                                } ${activeTab} selected`}
                            >
                                {activeTab === 'users'
                                    ? `${selectedUserIds.length} users`
                                    : `${selectedPermissionIds.length} permissions`}{' '}
                                selected
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Tabs */}
                <div className="border-b">
                    <div className="flex gap-4" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'users'}
                            aria-controls="users-panel"
                            id="users-tab"
                            className={`-mb-px border-b-2 px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                activeTab === 'users'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => handleTabChange('users')}
                        >
                            <Users
                                className="mr-2 inline h-4 w-4"
                                aria-hidden="true"
                            />
                            Users
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'permissions'}
                            aria-controls="permissions-panel"
                            id="permissions-tab"
                            className={`-mb-px border-b-2 px-4 py-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                activeTab === 'permissions'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => handleTabChange('permissions')}
                        >
                            <Shield
                                className="mr-2 inline h-4 w-4"
                                aria-hidden="true"
                            />
                            Permissions
                        </button>
                    </div>
                </div>

                {/* Tab Panels */}
                {activeTab === 'users' ? (
                    <form
                        onSubmit={handleSubmit}
                        role="tabpanel"
                        id="users-panel"
                        aria-labelledby="users-tab"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>User Assignments</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="submit"
                                            disabled={
                                                form.processing || isLoading
                                            }
                                            aria-busy={
                                                form.processing || isLoading
                                            }
                                        >
                                            {form.processing || isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save
                                                        className="mr-2 h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>
                                    Select users to assign this role. Changes
                                    will be saved immediately.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Search */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <Search
                                            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            type="search"
                                            id="user-search"
                                            placeholder="Search by name, email, or NIP..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="pl-10"
                                            aria-label="Search users by name, email, or NIP"
                                        />
                                    </div>
                                </div>

                                {/* Select All Checkbox */}
                                <div
                                    className="mb-4 flex items-center space-x-2 rounded-md border p-3"
                                    role="region"
                                    aria-label="Select all users"
                                >
                                    <Checkbox
                                        id="select-all"
                                        checked={allSelected}
                                        onCheckedChange={(checked) =>
                                            handleSelectAll(checked === true)
                                        }
                                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        aria-label={
                                            allSelected
                                                ? 'Deselect all users'
                                                : 'Select all users'
                                        }
                                    />
                                    <Label
                                        htmlFor="select-all"
                                        className="cursor-pointer font-medium"
                                    >
                                        {allSelected
                                            ? 'Deselect All'
                                            : someSelected
                                              ? 'Select All (Partial)'
                                              : 'Select All'}
                                    </Label>
                                    <span className="ml-auto text-sm text-muted-foreground">
                                        {selectedUserIds.length} of{' '}
                                        {users.total} users selected
                                    </span>
                                </div>

                                {/* User List */}
                                <div
                                    className="space-y-2"
                                    role="listbox"
                                    aria-label="Users list"
                                >
                                    {isLoading ? (
                                        // Show skeleton loaders while loading
                                        Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <UserRowSkeleton key={i} />
                                            ),
                                        )
                                    ) : users.data.length === 0 ? (
                                        <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">
                                                    {searchQuery
                                                        ? 'No users found matching your search.'
                                                        : 'No users available.'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        users.data.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center space-x-3 rounded-md border p-3 transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-muted/50"
                                                role="option"
                                                aria-selected={selectedUserIds.includes(
                                                    user.id,
                                                )}
                                            >
                                                <Checkbox
                                                    id={`user-${user.id}`}
                                                    checked={selectedUserIds.includes(
                                                        user.id,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleToggleUser(
                                                            user.id,
                                                            checked === true,
                                                        )
                                                    }
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                    aria-label={`Toggle ${role.name} role for ${user.name}`}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Label
                                                        htmlFor={`user-${user.id}`}
                                                        className="block cursor-pointer truncate font-medium"
                                                    >
                                                        {user.name}
                                                    </Label>
                                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-4">
                                                        <span className="truncate">
                                                            {user.email}
                                                        </span>
                                                        {user.nip && (
                                                            <span>
                                                                NIP: {user.nip}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedUserIds.includes(
                                                    user.id,
                                                ) && (
                                                    <CheckCircle2
                                                        className="h-5 w-5 shrink-0 text-green-500"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Pagination Info */}
                                {users.total > users.per_page && (
                                    <div className="mt-4 rounded-md border p-3 text-center text-sm text-muted-foreground">
                                        Showing {users.data.length} of{' '}
                                        {users.total} users (Page{' '}
                                        {users.current_page} of{' '}
                                        {users.last_page})
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </form>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        role="tabpanel"
                        id="permissions-panel"
                        aria-labelledby="permissions-tab"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Permission Assignments
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="submit"
                                            disabled={
                                                form.processing || isLoading
                                            }
                                            aria-busy={
                                                form.processing || isLoading
                                            }
                                        >
                                            {form.processing || isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save
                                                        className="mr-2 h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>
                                    Select permissions to grant to this role.
                                    Changes will be saved immediately.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {permissions ? (
                                    <PermissionList
                                        groups={permissions.groups}
                                        selectedPermissionIds={
                                            selectedPermissionIds
                                        }
                                        onPermissionToggle={
                                            handleTogglePermission
                                        }
                                        onModuleToggle={handleToggleModule}
                                        readOnly={false}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                                        <p className="text-sm text-muted-foreground">
                                            No permissions available.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </form>
                )}

                {/* Success/Error Toast */}
                {showSuccessToast && (
                    <div
                        className="fixed right-4 bottom-4 z-50 animate-in slide-in-from-right"
                        role="alert"
                        aria-live="polite"
                    >
                        <Card
                            className={`shadow-lg ${
                                toastMessage.includes('successfully')
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                    : 'border-red-500 bg-red-50 dark:bg-red-950'
                            }`}
                        >
                            <CardContent className="flex items-center gap-2 p-4">
                                {toastMessage.includes('successfully') ? (
                                    <CheckCircle2
                                        className="h-5 w-5 text-green-600 dark:text-green-400"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <div
                                        className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                                        aria-hidden="true"
                                    >
                                        !
                                    </div>
                                )}
                                <p className="text-sm font-medium">
                                    {toastMessage}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Confirmation Dialog */}
                <Dialog
                    open={showConfirmDialog}
                    onOpenChange={setShowConfirmDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle
                                    className="h-5 w-5 text-amber-500"
                                    aria-hidden="true"
                                />
                                <span>Confirm Role Removal</span>
                            </DialogTitle>
                            <DialogDescription>
                                {usersToRemove.length === 1
                                    ? `Are you sure you want to remove the ${role.name} role from this user?`
                                    : `Are you sure you want to remove the ${role.name} role from ${usersToRemove.length} users?`}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelRemoval}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleConfirmRemoval}
                            >
                                Remove Role
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Validation Errors */}
                {form.errors.user_ids && (
                    <div
                        className="rounded-md border border-red-500 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
                        role="alert"
                        aria-live="assertive"
                    >
                        {form.errors.user_ids}
                    </div>
                )}
                {form.errors.permission_ids && (
                    <div
                        className="rounded-md border border-red-500 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
                        role="alert"
                        aria-live="assertive"
                    >
                        {form.errors.permission_ids}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
