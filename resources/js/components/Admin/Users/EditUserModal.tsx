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
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { CheckCircle2, Eye, EyeOff, Loader2, Plus, X } from 'lucide-react';
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
    roles: Array<{ id: number; name: string }>;
}

interface EditUserModalProps {
    open: boolean;
    onClose: () => void;
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

export default function EditUserModal({ open, onClose, user, roles }: EditUserModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<number[]>(
        user.roles.map((r) => r.id),
    );

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        nip: user.nip || '',
        position: user.position || '',
        department: user.department || '',
        password: '',
        password_confirmation: '',
        is_active: user.is_active ? 'true' : 'false',
        email_verified: user.email_verified_at ? 'true' : 'false',
        roles: selectedRoles,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        // Update form data with selected roles
        setData('roles', selectedRoles);

        put(`/admin/users/${user.id}`, {
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
    };

    const handleClose = () => {
        reset();
        setSelectedRoles(user.roles.map((r) => r.id));
        clearErrors();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user information. Leave password empty to keep current password.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                            id="edit-phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={processing}
                        />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>

                    {/* NIP */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-nip">NIP</Label>
                        <Input
                            id="edit-nip"
                            value={data.nip}
                            onChange={(e) => setData('nip', e.target.value)}
                            disabled={processing}
                        />
                        {errors.nip && <p className="text-sm text-destructive">{errors.nip}</p>}
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-position">Position</Label>
                        <Input
                            id="edit-position"
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                            disabled={processing}
                        />
                        {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-department">Department</Label>
                        <Input
                            id="edit-department"
                            value={data.department}
                            onChange={(e) => setData('department', e.target.value)}
                            disabled={processing}
                        />
                        {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                    </div>

                    {/* Password (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-password">New Password (Optional)</Label>
                        <div className="relative">
                            <Input
                                id="edit-password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Leave empty to keep current"
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
                    {data.password && (
                        <div className="space-y-2">
                            <Label htmlFor="edit-password_confirmation">Confirm New Password</Label>
                            <Input
                                id="edit-password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                            )}
                        </div>
                    )}

                    {/* Email Verified Toggle */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="edit-email_verified">Email Verified</Label>
                        <Switch
                            id="edit-email_verified"
                            checked={data.email_verified === 'true'}
                            onCheckedChange={(checked) => setData('email_verified', checked ? 'true' : 'false')}
                            disabled={processing}
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-is_active">Status</Label>
                        <Select
                            value={data.is_active}
                            onValueChange={(value) => setData('is_active', value)}
                            disabled={processing}
                        >
                            <SelectTrigger id="edit-is_active">
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
                        <Label>Roles</Label>
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
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
