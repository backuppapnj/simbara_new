<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Collection;

class UserExport
{
    /**
     * Create a new export instance.
     */
    public function __construct(
        protected ?string $search = null,
        protected ?string $role = null,
        protected ?bool $isActive = null
    ) {}

    /**
     * Get the query for export.
     */
    public function query(): Builder
    {
        $query = User::query()
            ->with('roles')
            ->withoutGlobalScope(SoftDeletingScope::class); // Disable soft deletes for export

        // Apply search filter
        if ($this->search) {
            $query->where(function ($q) {
                $q->where('name', 'like', "%{$this->search}%")
                    ->orWhere('email', 'like', "%{$this->search}%")
                    ->orWhere('nip', 'like', "%{$this->search}%");
            });
        }

        // Apply role filter
        if ($this->role) {
            $query->whereHas('roles', function ($q) {
                $q->where('name', $this->role);
            });
        }

        // Apply status filter
        if ($this->isActive !== null) {
            $query->where('is_active', $this->isActive);
        }

        return $query;
    }

    /**
     * Map user data for export.
     */
    public function map(User $user): array
    {
        $roles = $user->roles->pluck('name')->implode(', ');

        return [
            $user->name,
            $user->email,
            $user->nip ?? '',
            $user->phone ?? '',
            $user->position ?? '',
            $roles,
            $user->is_active ? 'Active' : 'Inactive',
            $user->created_at?->format('Y-m-d H:i:s') ?? '',
        ];
    }

    /**
     * Get the export headers.
     *
     * @return array<string>
     */
    public function headers(): array
    {
        return [
            'Name',
            'Email',
            'NIP',
            'Phone',
            'Position',
            'Roles',
            'Status',
            'Created At',
        ];
    }

    /**
     * Get the collection of users for export.
     *
     * @return Collection<int, array<string>>
     */
    public function collection(): Collection
    {
        return $this->query()
            ->get()
            ->map(fn (User $user) => $this->map($user));
    }
}
