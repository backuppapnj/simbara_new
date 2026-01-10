<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Str;

/**
 * AssetHistory Model
 *
 * @property string $id
 * @property string $asset_id
 * @property string|null $lokasi_id_lama
 * @property string|null $lokasi_id_baru
 * @property string|null $user_id
 * @property string|null $keterangan
 */
class AssetHistory extends Model
{
    /** @use HasFactory<\Database\Factories\AssetHistoryFactory> */
    use HasFactory;

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (AssetHistory $assetHistory): void {
            if (empty($assetHistory->id)) {
                $assetHistory->id = (string) Str::ulid();
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'asset_id',
        'lokasi_id_lama',
        'lokasi_id_baru',
        'user_id',
        'keterangan',
    ];

    /**
     * Get the casts for the model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [];
    }

    /**
     * Get the asset that owns the history.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Get the old location that owns the history.
     */
    public function lokasiLama(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'lokasi_id_lama');
    }

    /**
     * Get the new location that owns the history.
     */
    public function lokasiBaru(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'lokasi_id_baru');
    }

    /**
     * Get the user that owns the history.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
