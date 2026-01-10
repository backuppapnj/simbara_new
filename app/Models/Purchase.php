<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class Purchase extends Model
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
        'status',
        'keterangan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Purchase $purchase): void {
            if (empty($purchase->id)) {
                $purchase->id = (string) Str::ulid();
            }

            if (empty($purchase->no_pembelian)) {
                $purchase->no_pembelian = 'PB-'.date('Ymd').'-'.str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
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
     * Purchase details for this purchase.
     */
    public function purchaseDetails(): HasMany
    {
        return $this->hasMany(PurchaseDetail::class);
    }
}
