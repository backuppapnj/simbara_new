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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import permissions from '@/routes/admin/permissions';
import { type CreatePermissionData } from '@/services/permissionService';
import { useForm } from '@inertiajs/react';
import { Loader2, Plus, Shield } from 'lucide-react';
import { useState } from 'react';

interface CreatePermissionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    availableModules?: string[];
}

const commonModules = [
    'assets',
    'atk_requests',
    'office_mutations',
    'office_requests',
    'office_usages',
    'stock_opnames',
    'users',
    'roles',
    'permissions',
    'reports',
    'settings',
    'notifications',
];

export default function CreatePermissionModal({
    open,
    onOpenChange,
    onSuccess,
    availableModules = commonModules,
}: CreatePermissionModalProps) {
    const [customModule, setCustomModule] = useState('');
    const [selectedModule, setSelectedModule] = useState<string>('');
    const [isCustomModule, setIsCustomModule] = useState(false);

    const form = useForm<CreatePermissionData>({
        name: '',
        module: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Determine which module value to use
        const moduleValue = isCustomModule ? customModule : selectedModule;

        // Validate
        if (!form.data.name.trim()) {
            form.setError('name', 'Permission name is required');
            return;
        }

        if (!moduleValue.trim()) {
            form.setError('module', 'Module is required');
            return;
        }

        // Update the module value before submitting
        form.setData('module', moduleValue);

        // Submit the form
        form.submit('post', permissions.store.url(), {
            onSuccess: () => {
                form.reset();
                setCustomModule('');
                setSelectedModule('');
                setIsCustomModule(false);
                onSuccess?.();
                onOpenChange(false);
            },
            onError: (errors) => {
                console.error('Error creating permission:', errors);
            },
        });
    };

    const handleModuleChange = (value: string) => {
        if (value === 'custom') {
            setIsCustomModule(true);
            setSelectedModule('');
            form.setData('module', customModule);
        } else {
            setIsCustomModule(false);
            setSelectedModule(value);
            form.setData('module', value);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" aria-hidden="true" />
                        <span>Create Permission</span>
                    </DialogTitle>
                    <DialogDescription>
                        Create a new permission to control access to specific
                        features or actions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                                Use snake_case for permission names (e.g.,{' '}
                                <code>view_assets</code>,{' '}
                                <code>create_atk_requests</code>)
                            </p>
                        </div>

                        {/* Module */}
                        <div className="space-y-2">
                            <Label htmlFor="module">
                                Module{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            {!isCustomModule ? (
                                <Select
                                    value={selectedModule}
                                    onValueChange={handleModuleChange}
                                    disabled={form.processing}
                                >
                                    <SelectTrigger
                                        id="module"
                                        aria-invalid={!!form.errors.module}
                                        aria-describedby={
                                            form.errors.module
                                                ? 'module-error'
                                                : undefined
                                        }
                                    >
                                        <SelectValue placeholder="Select a module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableModules.map((module) => (
                                            <SelectItem
                                                key={module}
                                                value={module}
                                            >
                                                {module
                                                    .replace(/_/g, ' ')
                                                    .toUpperCase()}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="custom">
                                            + Custom Module
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        id="module"
                                        placeholder="Enter custom module name"
                                        value={customModule}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setCustomModule(e.target.value);
                                            form.setData(
                                                'module',
                                                e.target.value,
                                            );
                                        }}
                                        disabled={form.processing}
                                        aria-invalid={!!form.errors.module}
                                        aria-describedby={
                                            form.errors.module
                                                ? 'module-error'
                                                : undefined
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCustomModule(false);
                                            setSelectedModule('');
                                            setCustomModule('');
                                        }}
                                        disabled={form.processing}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                            {form.errors.module && (
                                <p
                                    id="module-error"
                                    className="text-xs text-destructive"
                                >
                                    {form.errors.module}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Briefly describe what this permission controls..."
                                value={form.data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
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
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Permission
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
