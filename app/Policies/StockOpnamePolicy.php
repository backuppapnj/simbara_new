<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\StockOpname;
use App\Models\User;

class StockOpnamePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('stock_opname.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, StockOpname $stockOpname): bool
    {
        return $user->can('stock_opname.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('stock_opname.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, StockOpname $stockOpname): bool
    {
        // Only allow updates for draft status
        if ($stockOpname->status === 'draft') {
            return $user->can('stock_opname.create');
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, StockOpname $stockOpname): bool
    {
        // Only allow deletion for draft status
        if ($stockOpname->status === 'draft') {
            return $user->can('stock_opname.create');
        }

        return false;
    }

    /**
     * Determine whether the user can submit the stock opname.
     */
    public function submit(User $user, StockOpname $stockOpname): bool
    {
        if ($stockOpname->status !== 'draft') {
            return false;
        }

        return $user->can('stock_opname.submit');
    }

    /**
     * Determine whether the user can approve the stock opname.
     */
    public function approve(User $user, StockOpname $stockOpname): bool
    {
        if ($stockOpname->status !== 'submitted') {
            return false;
        }

        return $user->can('stock_opname.approve');
    }

    /**
     * Determine whether the user can export the stock opname.
     */
    public function export(User $user, StockOpname $stockOpname): bool
    {
        return $user->can('stock_opname.export');
    }
}
