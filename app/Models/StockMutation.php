<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class StockMutation extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'item_id',
        'jenis_mutasi',
        'jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'referensi_id',
        'referensi_tipe',
        'keterangan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (StockMutation $mutation): void {
            if (empty($mutation->id)) {
                $mutation->id = (string) Str::ulid();
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
            'stok_sebelum' => 'integer',
            'stok_sesudah' => 'integer',
        ];
    }

    /**
     * The item that owns the stock mutation.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
