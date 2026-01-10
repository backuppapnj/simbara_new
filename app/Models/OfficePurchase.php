<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class OfficePurchase extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'no_pembelian',
        'tanggal',
        'supplier',
        'total_nilai',
        'keterangan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (OfficePurchase $purchase): void {
            if (empty($purchase->id)) {
                $purchase->id = (string) Str::ulid();
            }
            if (empty($purchase->no_pembelian)) {
                $purchase->no_pembelian = 'PO-'.date('Ymd').'-'.strtoupper(substr((string) Str::ulid(), -6));
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
            'tanggal' => 'date',
            'total_nilai' => 'decimal:2',
        ];
    }

    /**
     * Details for this purchase.
     */
    public function details(): HasMany
    {
        return $this->hasMany(OfficePurchaseDetail::class, 'purchase_id');
    }
}
