<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestDetailResource extends JsonResource
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
            'item_id' => $this->item_id,
            'jumlah_diminta' => $this->jumlah_diminta,
            'jumlah_disetujui' => $this->jumlah_disetujui,
            'jumlah_diberikan' => $this->jumlah_diberikan,
            'item' => $this->whenLoaded('item'),
        ];
    }
}
