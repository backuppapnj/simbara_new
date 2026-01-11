<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class StockOpnameDetail extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'stock_opname_id',
        'item_id',
        'stok_sistem',
        'stok_fisik',
        'selisih',
        'keterangan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (StockOpnameDetail $detail): void {
            if (empty($detail->id)) {
                $detail->id = (string) Str::ulid();
            }

            // Auto-calculate selisih
            if (empty($detail->selisih) && ! empty($detail->stok_fisik) && ! empty($detail->stok_sistem)) {
                $detail->selisih = $detail->stok_fisik - $detail->stok_sistem;
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
            'stok_sistem' => 'integer',
            'stok_fisik' => 'integer',
            'selisih' => 'integer',
        ];
    }

    /**
     * The stock opname that owns the detail.
     */
    public function stockOpname(): BelongsTo
    {
        return $this->belongsTo(StockOpname::class);
    }

    /**
     * The item that belongs to the detail.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the photos for the stock opname detail.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(StockOpnamePhoto::class, 'stock_opname_detail_id')->orderBy('sequence');
    }
}
