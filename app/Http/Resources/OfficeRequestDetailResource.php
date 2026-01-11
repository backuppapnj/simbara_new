<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeRequestDetailResource extends JsonResource
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
            'request_id' => $this->request_id,
            'supply_id' => $this->supply_id,
            'jumlah' => $this->jumlah,
            'jumlah_diberikan' => $this->jumlah_diberikan,
            'supply' => $this->whenLoaded('supply'),
        ];
    }
}
