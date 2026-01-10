<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class OfficeMutation extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'supply_id',
        'jenis_mutasi',
        'jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'tipe',
        'referensi_id',
        'user_id',
        'keterangan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (OfficeMutation $mutation): void {
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
        return [];
    }

    /**
     * The office supply that owns the mutation.
     */
    public function supply(): BelongsTo
    {
        return $this->belongsTo(OfficeSupply::class, 'supply_id');
    }

    /**
     * The user that created the mutation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
