<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class StockOpname extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'no_so',
        'tanggal',
        'periode_bulan',
        'periode_tahun',
        'status',
        'approved_by',
        'approved_at',
        'keterangan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (StockOpname $stockOpname): void {
            if (empty($stockOpname->id)) {
                $stockOpname->id = (string) Str::ulid();
            }

            if (empty($stockOpname->no_so)) {
                $stockOpname->no_so = 'SO-'.date('Ymd').'-'.str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
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
            'periode_tahun' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Stock opname details for this stock opname.
     */
    public function stockOpnameDetails(): HasMany
    {
        return $this->hasMany(StockOpnameDetail::class);
    }

    /**
     * The user who approved the stock opname.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
