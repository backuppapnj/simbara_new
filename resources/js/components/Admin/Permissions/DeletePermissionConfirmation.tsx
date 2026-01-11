import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Permission } from '@/services/permissionService';
import { AlertTriangle, Loader2, Shield, Trash2, Users } from 'lucide-react';

interface DeletePermissionConfirmationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permission: Permission | null;
    rolesUsingPermission?: Array<{ id: number; name: string }>;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export default function DeletePermissionConfirmation({
    open,
    onOpenChange,
    permission,
    rolesUsingPermission = [],
    onConfirm,
    isDeleting = false,
}: DeletePermissionConfirmationProps) {
    if (!permission) return null;

    const hasRolesUsing = rolesUsingPermission.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        <span>Delete Permission</span>
                    </DialogTitle>
                    <DialogDescription>
                        {hasRolesUsing
                            ? 'This permission is currently in use. Deleting it will remove access from all affected roles.'
                            : 'Are you sure you want to delete this permission? This action cannot be undone.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Permission Info */}
                    <div className="rounded-md border bg-muted/50 p-4">
                        <div className="flex items-start gap-3">
                            <Shield
                                className="mt-0.5 h-5 w-5 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                    {permission.name.replace(/_/g, ' ')}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {permission.module
                                        .replace(/_/g, ' ')
                                        .toUpperCase()}
                                </p>
                                {permission.description && (
                                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                        {permission.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Roles Using Warning */}
                    {hasRolesUsing && (
                        <div className="rounded-md border border-amber-500/50 bg-amber-50 p-4 dark:bg-amber-950">
                            <div className="flex items-start gap-3">
                                <Users
                                    className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400"
                                    aria-hidden="true"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-amber-900 dark:text-amber-100">
                                        {rolesUsingPermission.length} role
                                        {rolesUsingPermission.length !== 1
                                            ? 's'
                                            : ''}{' '}
                                        using this permission
                                    </p>
                                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                                        Deleting this permission will remove it
                                        from the following roles:
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {rolesUsingPermission.map((role) => (
                                            <Badge
                                                key={role.id}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning Message */}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertTriangle
                            className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                            aria-hidden="true"
                        />
                        <p>
                            This action cannot be undone. Please confirm that
                            you want to proceed with deleting this permission.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        aria-busy={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Permission
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
