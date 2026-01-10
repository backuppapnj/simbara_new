<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AtkRequestResource extends JsonResource
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
            'level1_approval_by' => $this->level1_approval_by,
            'level1_approval_at' => $this->level1_approval_at?->toIso8601String(),
            'level2_approval_by' => $this->level2_approval_by,
            'level2_approval_at' => $this->level2_approval_at?->toIso8601String(),
            'level3_approval_by' => $this->level3_approval_by,
            'level3_approval_at' => $this->level3_approval_at?->toIso8601String(),
            'keterangan' => $this->keterangan,
            'alasan_penolakan' => $this->alasan_penolakan,
            'user' => $this->whenLoaded('user'),
            'department' => $this->whenLoaded('department'),
            'level1_approver' => $this->whenLoaded('level1Approver'),
            'level2_approver' => $this->whenLoaded('level2Approver'),
            'level3_approver' => $this->whenLoaded('level3Approver'),
            'request_details' => RequestDetailResource::collection($this->whenLoaded('requestDetails')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
