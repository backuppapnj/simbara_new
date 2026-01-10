<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class Item extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'satuan',
        'kategori',
        'stok',
        'stok_minimal',
        'stok_maksimal',
        'harga_beli_terakhir',
        'harga_rata_rata',
        'harga_jual',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Item $item): void {
            if (empty($item->id)) {
                $item->id = (string) Str::ulid();
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
            'harga_beli_terakhir' => 'decimal:2',
            'harga_rata_rata' => 'decimal:2',
            'harga_jual' => 'decimal:2',
        ];
    }

    /**
     * Stock mutations for this item.
     */
    public function stockMutations(): HasMany
    {
        return $this->hasMany(StockMutation::class);
    }

    /**
     * Purchase details for this item.
     */
    public function purchaseDetails(): HasMany
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    /**
     * Request details for this item.
     */
    public function requestDetails(): HasMany
    {
        return $this->hasMany(RequestDetail::class);
    }

    /**
     * Stock opname details for this item.
     */
    public function stockOpnameDetails(): HasMany
    {
        return $this->hasMany(StockOpnameDetail::class);
    }

    /**
     * Check if stock is below reorder point.
     */
    public function isBelowReorderPoint(): bool
    {
        return $this->stok <= $this->stok_minimal;
    }
}
