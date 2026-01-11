<?php

namespace App\Events;

use App\Models\OfficeSupply;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OfficeSupplyReorderPointAlert
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public OfficeSupply $supply,
    ) {}
}
