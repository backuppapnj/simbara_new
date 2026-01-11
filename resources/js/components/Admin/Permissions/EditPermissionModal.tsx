import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import type { Permission } from '@/services/permissionService';
import { useForm } from '@inertiajs/react';
import { Loader2, Save, Shield } from 'lucide-react';

interface EditPermissionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permission: Permission | null;
    onSuccess?: () => void;
}

export default function EditPermissionModal({
    open,
    onOpenChange,
    permission,
    onSuccess,
}: EditPermissionModalProps) {
    const form = useForm({
        name: permission?.name || '',
        description: permission?.description || '',
    });

    // Reset form when permission changes
    if (permission && form.data.name !== permission.name) {
        form.setData('name', permission.name);
        form.setData('description', permission.description || '');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!permission) return;

        if (!form.data.name.trim()) {
            form.setError('name', 'Permission name is required');
            return;
        }

        form.put(route('admin.permissions.update', permission.id), {
            onSuccess: () => {
                form.reset();
                onSuccess?.();
                onOpenChange(false);
            },
            onError: (errors) => {
                console.error('Error updating permission:', errors);
            },
        });
    };

    if (!permission) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" aria-hidden="true" />
                        <span>Edit Permission</span>
                    </DialogTitle>
                    <DialogDescription>
                        Update the permission details. Changes will affect all
                        roles that have this permission assigned.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Module (Read-only) */}
                        <div className="space-y-2">
                            <Label>Module</Label>
                            <Input
                                value={permission.module
                                    .replace(/_/g, ' ')
                                    .toUpperCase()}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Module cannot be changed after creation.
                            </p>
                        </div>

                        {/* Permission Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Permission Name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., view_assets, create_atk_requests"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                disabled={form.processing}
                                aria-invalid={!!form.errors.name}
                                aria-describedby={
                                    form.errors.name ? 'name-error' : undefined
                                }
                            />
                            {form.errors.name && (
                                <p
                                    id="name-error"
                                    className="text-xs text-destructive"
                                >
                                    {form.errors.name}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Use snake_case for permission names.
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Briefly describe what this permission controls..."
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                                disabled={form.processing}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional description to help administrators
                                understand this permission's purpose.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={form.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            aria-busy={form.processing}
                        >
                            {form.processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
