<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Str;

class OfficeUsage extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'supply_id',
        'jumlah',
        'tanggal',
        'keperluan',
        'user_id',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (OfficeUsage $usage): void {
            if (empty($usage->id)) {
                $usage->id = (string) Str::ulid();
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
        ];
    }

    /**
     * The office supply for this usage.
     */
    public function supply(): BelongsTo
    {
        return $this->belongsTo(OfficeSupply::class, 'supply_id');
    }

    /**
     * The user who recorded the usage.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
