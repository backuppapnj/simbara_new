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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { CheckCircle2, Eye, EyeOff, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void;
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

export default function CreateUserModal({ open, onClose, roles }: CreateUserModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        nip: '',
        position: '',
        department: '',
        password: '',
        password_confirmation: '',
        is_active: 'true',
        roles: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        // Update form data with selected roles
        setData('roles', selectedRoles);

        post('/admin/users', {
            onSuccess: () => {
                reset();
                setSelectedRoles([]);
                onClose();
            },
        });
    };

    const toggleRole = (roleId: number) => {
        setSelectedRoles((prev) => {
            if (prev.includes(roleId)) {
                return prev.filter((id) => id !== roleId);
            }
            return [...prev, roleId];
        });
        // Clear role error if at least one role is selected
        if (selectedRoles.length === 0) {
            clearErrors('roles');
        }
    };

    const handleClose = () => {
        reset();
        setSelectedRoles([]);
        clearErrors();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Fill in the user details below. Fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="John Doe"
                            disabled={processing}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="john@example.com"
                            disabled={processing}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="+62812345678"
                            disabled={processing}
                        />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>

                    {/* NIP */}
                    <div className="space-y-2">
                        <Label htmlFor="nip">NIP</Label>
                        <Input
                            id="nip"
                            value={data.nip}
                            onChange={(e) => setData('nip', e.target.value)}
                            placeholder="12345"
                            disabled={processing}
                        />
                        {errors.nip && <p className="text-sm text-destructive">{errors.nip}</p>}
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                            id="position"
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                            placeholder="Staff"
                            disabled={processing}
                        />
                        {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                            id="department"
                            value={data.department}
                            onChange={(e) => setData('department', e.target.value)}
                            placeholder="IT Department"
                            disabled={processing}
                        />
                        {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                disabled={processing}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                disabled={processing}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    {/* Password Confirmation */}
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Confirm Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            disabled={processing}
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="is_active">Status</Label>
                        <Select
                            value={data.is_active}
                            onValueChange={(value) => setData('is_active', value)}
                            disabled={processing}
                        >
                            <SelectTrigger id="is_active">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Roles */}
                    <div className="space-y-2">
                        <Label>
                            Roles <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role) => {
                                const isSelected = selectedRoles.includes(role.id);
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => toggleRole(role.id)}
                                        disabled={processing}
                                        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                            isSelected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input bg-background hover:bg-accent'
                                        }`}
                                    >
                                        {isSelected ? (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        ) : (
                                            <Plus className="h-3.5 w-3.5" />
                                        )}
                                        {roleDisplayNames[role.name] || role.name}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
                        {selectedRoles.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || selectedRoles.length === 0}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
