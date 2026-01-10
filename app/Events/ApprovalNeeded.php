<?php

namespace App\Events;

use App\Models\AtkRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ApprovalNeeded
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public AtkRequest $request,
        public int $level,
        public string $role,
    ) {}
}
