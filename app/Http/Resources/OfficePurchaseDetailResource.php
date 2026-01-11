<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficePurchaseDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'supply_id' => $this->supply_id,
            'jumlah' => $this->jumlah,
            'subtotal' => $this->subtotal,
            'supply' => $this->whenLoaded('supply'),
        ];
    }
}
