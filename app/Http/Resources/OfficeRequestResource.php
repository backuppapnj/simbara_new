<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeRequestResource extends JsonResource
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
            'no_permintaan' => $this->no_permintaan,
            'user_id' => $this->user_id,
            'department_id' => $this->department_id,
            'tanggal' => $this->tanggal,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'keterangan' => $this->keterangan,
            'alasan_penolakan' => $this->alasan_penolakan,
            'user' => $this->whenLoaded('user'),
            'department' => $this->whenLoaded('department'),
            'approved_by_user' => $this->whenLoaded('approvedBy'),
            'details' => OfficeRequestDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
