<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class PurchaseDetail extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'purchase_id',
        'item_id',
        'jumlah',
        'jumlah_diterima',
        'harga_satuan',
        'subtotal',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (PurchaseDetail $detail): void {
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
            'jumlah' => 'integer',
            'jumlah_diterima' => 'integer',
            'harga_satuan' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * The purchase that owns the detail.
     */
    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    /**
     * The item that belongs to the detail.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
