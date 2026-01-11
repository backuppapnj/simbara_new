<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficePurchaseResource extends JsonResource
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
            'no_pembelian' => $this->no_pembelian,
            'tanggal' => $this->tanggal,
            'supplier' => $this->supplier,
            'total_nilai' => $this->total_nilai,
            'keterangan' => $this->keterangan,
            'details' => OfficePurchaseDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
