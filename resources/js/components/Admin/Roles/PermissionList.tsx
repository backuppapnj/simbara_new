import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type {
    PermissionGroup,
    RolePermission,
} from '@/services/permissionService';
import { ChevronDown, ChevronRight, Search, Shield } from 'lucide-react';
import { useState } from 'react';

interface PermissionListProps {
    groups: PermissionGroup[];
    selectedPermissionIds: number[];
    onPermissionToggle: (permissionId: number, checked: boolean) => void;
    onModuleToggle: (module: string, checked: boolean) => void;
    readOnly?: boolean;
}

export default function PermissionList({
    groups,
    selectedPermissionIds,
    onPermissionToggle,
    onModuleToggle,
    readOnly = false,
}: PermissionListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        new Set(groups.map((g) => g.module)),
    );

    // Filter groups and permissions based on search
    const filteredGroups = groups
        .map((group) => ({
            ...group,
            permissions: group.permissions.filter(
                (p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.module
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (p.description &&
                        p.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())),
            ),
        }))
        .filter((group) => group.permissions.length > 0);

    // Toggle module expansion
    const toggleModule = (module: string) => {
        setExpandedModules((prev) => {
            const next = new Set(prev);
            if (next.has(module)) {
                next.delete(module);
            } else {
                next.add(module);
            }
            return next;
        });
    };

    // Check if all permissions in a module are selected
    const isModuleFullySelected = (permissions: RolePermission[]): boolean => {
        return (
            permissions.length > 0 &&
            permissions.every((p) => selectedPermissionIds.includes(p.id))
        );
    };

    // Check if some permissions in a module are selected
    const isModulePartiallySelected = (
        permissions: RolePermission[],
    ): boolean => {
        return permissions.some((p) => selectedPermissionIds.includes(p.id));
    };

    // Handle module checkbox change
    const handleModuleChange = (module: string, checked: boolean) => {
        onModuleToggle(module, checked);
    };

    // Calculate stats
    const totalPermissions = groups.reduce(
        (sum, group) => sum + group.permissions.length,
        0,
    );
    const selectedCount = selectedPermissionIds.length;

    return (
        <div className="space-y-4">
            {/* Search and Stats */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search
                        className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        placeholder="Search permissions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        aria-label="Search permissions"
                    />
                </div>
                <Badge variant="secondary" className="text-sm">
                    {selectedCount} / {totalPermissions} selected
                </Badge>
            </div>

            {/* Permission Groups */}
            {filteredGroups.length === 0 ? (
                <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                    <p className="text-sm text-muted-foreground">
                        {searchQuery
                            ? 'No permissions found matching your search.'
                            : 'No permissions available.'}
                    </p>
                </div>
            ) : (
                <div
                    className="space-y-3"
                    role="tree"
                    aria-label="Permission modules"
                >
                    {filteredGroups.map((group) => {
                        const isExpanded = expandedModules.has(group.module);
                        const isFullySelected = isModuleFullySelected(
                            group.permissions,
                        );
                        const isPartiallySelected =
                            !isFullySelected &&
                            isModulePartiallySelected(group.permissions);

                        return (
                            <div
                                key={group.module}
                                className="rounded-md border"
                                role="treeitem"
                                aria-expanded={isExpanded}
                            >
                                {/* Module Header */}
                                <div
                                    className={cn(
                                        'flex items-center gap-3 rounded-t-md border-b bg-muted/50 p-4 transition-colors',
                                        !isExpanded &&
                                            'rounded-b-md border-b-0',
                                    )}
                                >
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                            toggleModule(group.module)
                                        }
                                        aria-label={
                                            isExpanded
                                                ? `Collapse ${group.module} module`
                                                : `Expand ${group.module} module`
                                        }
                                    >
                                        {isExpanded ? (
                                            <ChevronDown
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <ChevronRight
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </Button>

                                    <Shield
                                        className="h-4 w-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />

                                    <div className="flex-1">
                                        <Label className="font-semibold capitalize">
                                            {group.module.replace(/_/g, ' ')}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {group.permissions.length}{' '}
                                            permission
                                            {group.permissions.length !== 1
                                                ? 's'
                                                : ''}
                                        </p>
                                    </div>

                                    {!readOnly && (
                                        <Checkbox
                                            id={`module-${group.module}`}
                                            checked={isFullySelected}
                                            onCheckedChange={(checked) =>
                                                handleModuleChange(
                                                    group.module,
                                                    checked === true,
                                                )
                                            }
                                            aria-label={`Select all permissions in ${group.module} module`}
                                            className={cn(
                                                'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                                                isPartiallySelected &&
                                                    'data-[state=unchecked]:bg-primary/50',
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Module Permissions */}
                                {isExpanded && (
                                    <div
                                        className="space-y-1 p-4"
                                        role="group"
                                        aria-label={`${group.module} permissions`}
                                    >
                                        {group.permissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className={cn(
                                                    'flex items-start gap-3 rounded-md border p-3 transition-colors',
                                                    selectedPermissionIds.includes(
                                                        permission.id,
                                                    ) &&
                                                        'border-primary/20 bg-primary/5',
                                                    !readOnly &&
                                                        'cursor-pointer hover:bg-muted/50',
                                                )}
                                                onClick={() => {
                                                    if (!readOnly) {
                                                        onPermissionToggle(
                                                            permission.id,
                                                            !selectedPermissionIds.includes(
                                                                permission.id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                                role="option"
                                                aria-selected={selectedPermissionIds.includes(
                                                    permission.id,
                                                )}
                                            >
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={selectedPermissionIds.includes(
                                                        permission.id,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        onPermissionToggle(
                                                            permission.id,
                                                            checked === true,
                                                        )
                                                    }
                                                    disabled={readOnly}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                    aria-label={`Toggle ${permission.name} permission`}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <Label
                                                        htmlFor={`permission-${permission.id}`}
                                                        className={cn(
                                                            'block cursor-pointer truncate font-medium',
                                                            readOnly &&
                                                                'cursor-default',
                                                        )}
                                                    >
                                                        {permission.name.replace(
                                                            /_/g,
                                                            ' ',
                                                        )}
                                                    </Label>
                                                    {permission.description && (
                                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                            {
                                                                permission.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                {selectedPermissionIds.includes(
                                                    permission.id,
                                                ) && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="shrink-0 text-xs"
                                                    >
                                                        Assigned
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Info */}
            {searchQuery && filteredGroups.length > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                    Showing {filteredGroups.length} of {groups.length} modules
                </p>
            )}
        </div>
    );
}
