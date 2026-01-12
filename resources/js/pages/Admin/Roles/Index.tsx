import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import adminRolesRoutes from '@/routes/admin/roles';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Shield, Users } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
    users_count: number;
    permissions_count?: number;
}

interface IndexProps {
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

// Skeleton loader for role cards
function RoleCardSkeleton() {
    return (
        <Card className="animate-pulse" aria-hidden="true">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex h-6 items-center gap-2">
                            <div className="h-5 w-5 rounded bg-muted" />
                            <div className="h-5 w-32 rounded bg-muted" />
                        </div>
                        <div className="h-4 w-24 rounded bg-muted" />
                    </div>
                    <div className="h-6 w-8 rounded bg-muted" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-8 w-28 rounded bg-muted" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function RolesIndex({ roles }: IndexProps) {
    const [isLoading] = useState(false);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Roles',
            href: adminRolesRoutes.index.url(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Role Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage user roles and permissions
                        </p>
                    </div>
                </div>

                {/* Roles Grid */}
                <div
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    role="list"
                    aria-label="Roles list"
                >
                    {isLoading
                        ? // Show skeleton loaders while loading
                          Array.from({ length: 6 }).map((_, i) => (
                              <RoleCardSkeleton key={i} />
                          ))
                        : roles.map((role) => (
                              <Card
                                  key={role.id}
                                  className="transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md"
                                  role="listitem"
                              >
                                  <CardHeader>
                                      <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                              <CardTitle className="flex items-center gap-2">
                                                  <Users
                                                      className="h-5 w-5"
                                                      aria-hidden="true"
                                                  />
                                                  <span>
                                                      {roleDisplayNames[
                                                          role.name
                                                      ] || role.name}
                                                  </span>
                                              </CardTitle>
                                              <CardDescription className="mt-1">
                                                  {role.name}
                                              </CardDescription>
                                          </div>
                                          <Badge
                                              variant="secondary"
                                              className="text-sm"
                                              aria-label={`${role.users_count} users assigned`}
                                          >
                                              {role.users_count}
                                          </Badge>
                                      </div>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="space-y-3">
                                          <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                  <span className="flex items-center gap-1.5">
                                                      <Users
                                                          className="h-3.5 w-3.5"
                                                          aria-hidden="true"
                                                      />
                                                      {role.users_count} user
                                                      {role.users_count !== 1
                                                          ? 's'
                                                          : ''}{' '}
                                                      assigned
                                                  </span>
                                                  {role.permissions_count !==
                                                      undefined && (
                                                      <span className="flex items-center gap-1.5">
                                                          <Shield
                                                              className="h-3.5 w-3.5"
                                                              aria-hidden="true"
                                                          />
                                                          {
                                                              role.permissions_count
                                                          }{' '}
                                                          permission
                                                          {role.permissions_count !==
                                                          1
                                                              ? 's'
                                                              : ''}
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Link
                                                  href={adminRolesRoutes.show.url(
                                                      role.id,
                                                      {
                                                          query: {
                                                              tab: 'users',
                                                          },
                                                      },
                                                  )}
                                                  className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                              >
                                                  <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="flex-1"
                                                      aria-label={`Manage users for ${roleDisplayNames[role.name] || role.name} role`}
                                                  >
                                                      <Eye
                                                          className="mr-2 h-4 w-4"
                                                          aria-hidden="true"
                                                      />
                                                      <span>Users</span>
                                                  </Button>
                                              </Link>
                                              <Link
                                                  href={adminRolesRoutes.show.url(
                                                      role.id,
                                                      {
                                                          query: {
                                                              tab: 'permissions',
                                                          },
                                                      },
                                                  )}
                                                  className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                              >
                                                  <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="flex-1"
                                                      aria-label={`Manage permissions for ${roleDisplayNames[role.name] || role.name} role`}
                                                  >
                                                      <Shield
                                                          className="mr-2 h-4 w-4"
                                                          aria-hidden="true"
                                                      />
                                                      <span>Permissions</span>
                                                  </Button>
                                              </Link>
                                          </div>
                                      </div>
                                  </CardContent>
                              </Card>
                          ))}
                </div>

                {/* Summary */}
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">
                            Total {roles.length} role
                            {roles.length !== 1 ? 's' : ''} configured in the
                            system
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
