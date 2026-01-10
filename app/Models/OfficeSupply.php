<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class OfficeSupply extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'nama_barang',
        'satuan',
        'kategori',
        'deskripsi',
        'stok',
        'stok_minimal',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (OfficeSupply $supply): void {
            if (empty($supply->id)) {
                $supply->id = (string) Str::ulid();
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
        return [];
    }

    /**
     * Mutations for this office supply.
     */
    public function mutations(): HasMany
    {
        return $this->hasMany(OfficeMutation::class, 'supply_id');
    }

    /**
     * Request details for this office supply.
     */
    public function requestDetails(): HasMany
    {
        return $this->hasMany(OfficeRequestDetail::class, 'supply_id');
    }

    /**
     * Usage records for this office supply.
     */
    public function usages(): HasMany
    {
        return $this->hasMany(OfficeUsage::class, 'supply_id');
    }

    /**
     * Check if stock is below reorder point.
     */
    public function isBelowReorderPoint(): bool
    {
        return $this->stok <= $this->stok_minimal;
    }
}
