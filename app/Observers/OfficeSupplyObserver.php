<?php

namespace App\Observers;

use App\Events\OfficeSupplyReorderPointAlert;
use App\Models\OfficeSupply;

class OfficeSupplyObserver
{
    /**
     * Handle the OfficeSupply "updated" event.
     */
    public function updated(OfficeSupply $supply): void
    {
        // Check if stock changed and is now at or below reorder point
        if ($supply->isDirty('stok') && $supply->isBelowReorderPoint()) {
            OfficeSupplyReorderPointAlert::dispatch($supply);
        }
    }
}
