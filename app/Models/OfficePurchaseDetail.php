<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Str;

class OfficePurchaseDetail extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'purchase_id',
        'supply_id',
        'jumlah',
        'subtotal',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (OfficePurchaseDetail $detail): void {
            if (empty($detail->id)) {
                $detail->id = (string) Str::ulid();
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * The purchase that owns the detail.
     */
    public function purchase(): BelongsTo
    {
        return $this->belongsTo(OfficePurchase::class, 'purchase_id');
    }

    /**
     * The office supply for this detail.
     */
    public function supply(): BelongsTo
    {
        return $this->belongsTo(OfficeSupply::class, 'supply_id');
    }
}
