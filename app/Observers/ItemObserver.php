<?php

namespace App\Observers;

use App\Events\ReorderPointAlert;
use App\Models\Item;

class ItemObserver
{
    /**
     * Handle the Item "updated" event.
     */
    public function updated(Item $item): void
    {
        // Check if stock changed and is now at or below reorder point
        if ($item->isDirty('stok') && $item->isBelowReorderPoint()) {
            ReorderPointAlert::dispatch($item);
        }
    }
}
