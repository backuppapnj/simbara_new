<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Str;

/**
 * AssetConditionLog Model
 *
 * @property string $id
 * @property string $asset_id
 * @property string|null $kd_kondisi_lama
 * @property string|null $kd_kondisi_baru
 * @property string|null $ur_kondisi_lama
 * @property string|null $ur_kondisi_baru
 * @property string|null $alasan
 * @property string|null $user_id
 */
class AssetConditionLog extends Model
{
    /** @use HasFactory<\Database\Factories\AssetConditionLogFactory> */
    use HasFactory;

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (AssetConditionLog $assetConditionLog): void {
            if (empty($assetConditionLog->id)) {
                $assetConditionLog->id = (string) Str::ulid();
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
        'kd_kondisi_lama',
        'kd_kondisi_baru',
        'ur_kondisi_lama',
        'ur_kondisi_baru',
        'alasan',
        'user_id',
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
     * Get the asset that owns the condition log.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Get the user that owns the condition log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
