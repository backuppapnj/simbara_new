import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ExportButton } from '@/components/Admin/Users/ExportButton';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    roles: string[];
    roles_count: number;
}

interface Role {
    id: number;
    name: string;
}

interface UsersResponse {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    search?: string;
    role?: string;
    is_active?: string | null;
    department?: string;
    sort_by?: string;
    sort_direction?: string;
    per_page?: string | number;
}

interface IndexProps {
    users: UsersResponse;
    filters: Filters;
    roles: Role[];
}

// Skeleton loader for table rows
function TableSkeleton() {
    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            </td>
            <td className="p-4">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-1 h-3 w-48 animate-pulse rounded bg-muted" />
            </td>
            <td className="p-4">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </td>
            <td className="p-4">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </td>
            <td className="p-4">
                <div className="h-6 w-16 animate-pulse rounded bg-muted" />
            </td>
            <td className="p-4">
                <div className="flex gap-1">
                    <div className="h-6 w-12 animate-pulse rounded bg-muted" />
                    <div className="h-6 w-12 animate-pulse rounded bg-muted" />
                </div>
            </td>
            <td className="p-4">
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            </td>
        </tr>
    );
}

export default function UsersIndex({ users: initialUsers, filters: initialFilters, roles }: IndexProps) {
    const [users, setUsers] = useState<UsersResponse>(initialUsers);
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [isLoading, setIsLoading] = useState(false);

    // Get initials from name
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Role display names
    const roleDisplayNames: Record<string, string> = {
        super_admin: 'Super Admin',
        kpa: 'KPA',
        kasubag_umum: 'Kasubag Umum',
        pegawai: 'Pegawai',
        operator_bmn: 'Operator BMN',
        operator_atk: 'Operator ATK',
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, String(value));
                }
            });

            router.get(
                `/admin/users?${params.toString()}`,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onStart: () => setIsLoading(true),
                    onFinish: () => setIsLoading(false),
                    onSuccess: (page) => {
                        setUsers((page.props as any).users);
                    },
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    const handleFilterChange = (key: string, value: string | null) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSearchChange = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            search: value,
        }));
    };

    const handleSort = (field: string) => {
        const direction = filters.sort_by === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';
        setFilters((prev) => ({
            ...prev,
            sort_by: field,
            sort_direction: direction,
        }));
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
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage user accounts, roles, and permissions
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <ExportButton filters={filters} />
                        <Link href="/admin/users/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <label htmlFor="search" className="text-sm font-medium">
                                    Search
                                </label>
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Name, email, or NIP..."
                                    defaultValue={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            {/* Role Filter */}
                            <div className="space-y-2">
                                <label htmlFor="role" className="text-sm font-medium">
                                    Role
                                </label>
                                <Select
                                    value={filters.role || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('role', value === 'all' ? null : value)
                                    }
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {roleDisplayNames[role.name] || role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label htmlFor="status" className="text-sm font-medium">
                                    Status
                                </label>
                                <Select
                                    value={filters.is_active ?? 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange(
                                            'is_active',
                                            value === 'all' ? null : value,
                                        )
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Per Page */}
                            <div className="space-y-2">
                                <label htmlFor="per_page" className="text-sm font-medium">
                                    Per Page
                                </label>
                                <Select
                                    value={String(filters.per_page || 20)}
                                    onValueChange={(value) => handleFilterChange('per_page', value)}
                                >
                                    <SelectTrigger id="per_page">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Users</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                {users.total} total
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Page {users.current_page} of {users.last_page}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            User
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            NIP
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Position
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Roles
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading
                                        ? Array.from({ length: 5 }).map((_, i) => <TableSkeleton key={i} />)
                                        : users.data.map((user) => (
                                              <tr
                                                  key={user.id}
                                                  className="border-b transition-colors hover:bg-muted/50"
                                              >
                                                  {/* User Info */}
                                                  <td className="p-4 align-middle">
                                                      <div className="flex items-center gap-3">
                                                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                              {getInitials(user.name)}
                                                          </div>
                                                          <div>
                                                              <div className="font-medium">{user.name}</div>
                                                              <div className="text-sm text-muted-foreground">
                                                                  {user.email}
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </td>

                                                  {/* NIP */}
                                                  <td className="p-4 align-middle text-muted-foreground">
                                                      {user.nip || '-'}
                                                  </td>

                                                  {/* Position */}
                                                  <td className="p-4 align-middle">
                                                      {user.position || user.department || '-'}
                                                  </td>

                                                  {/* Status */}
                                                  <td className="p-4 align-middle">
                                                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                                          {user.is_active ? 'Active' : 'Inactive'}
                                                      </Badge>
                                                  </td>

                                                  {/* Roles */}
                                                  <td className="p-4 align-middle">
                                                      <div className="flex flex-wrap gap-1">
                                                          {user.roles.length > 0 ? (
                                                              user.roles.map((role) => (
                                                                  <Badge key={role} variant="outline" className="text-xs">
                                                                      {roleDisplayNames[role] || role}
                                                                  </Badge>
                                                              ))
                                                          ) : (
                                                              <span className="text-sm text-muted-foreground">
                                                                  No roles
                                                              </span>
                                                          )}
                                                      </div>
                                                  </td>

                                                  {/* Actions */}
                                                  <td className="p-4 text-right align-middle">
                                                      <div className="flex justify-end gap-2">
                                                          <Link href={`/admin/users/${user.id}`}>
                                                              <Button variant="ghost" size="sm">
                                                                  View
                                                              </Button>
                                                          </Link>
                                                      </div>
                                                  </td>
                                              </tr>
                                          ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {users.data.length} of {users.total} users
                                </div>
                                <div className="flex gap-2">
                                    {users.current_page > 1 && (
                                        <Link
                                            href={`/admin/users?page=${users.current_page - 1}`}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {users.current_page < users.last_page && (
                                        <Link
                                            href={`/admin/users?page=${users.current_page + 1}`}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
