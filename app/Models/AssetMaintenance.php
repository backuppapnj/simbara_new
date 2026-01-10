<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Str;

/**
 * AssetMaintenance Model
 *
 * @property string $id
 * @property string $asset_id
 * @property string|null $jenis_perawatan
 * @property \DateTime|null $tanggal
 * @property float|null $biaya
 * @property string|null $pelaksana
 * @property string|null $keterangan
 */
class AssetMaintenance extends Model
{
    /** @use HasFactory<\Database\Factories\AssetMaintenanceFactory> */
    use HasFactory;

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (AssetMaintenance $assetMaintenance): void {
            if (empty($assetMaintenance->id)) {
                $assetMaintenance->id = (string) Str::ulid();
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
        'jenis_perawatan',
        'tanggal',
        'biaya',
        'pelaksana',
        'keterangan',
    ];

    /**
     * Get the casts for the model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'biaya' => 'decimal:2',
        ];
    }

    /**
     * Get the asset that owns the maintenance.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
