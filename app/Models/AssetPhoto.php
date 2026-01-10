<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Str;

/**
 * AssetPhoto Model
 *
 * @property string $id
 * @property string $asset_id
 * @property string $file_path
 * @property string $file_name
 * @property int $file_size
 * @property string $mime_type
 * @property string|null $caption
 * @property bool $is_primary
 */
class AssetPhoto extends Model
{
    /** @use HasFactory<\Database\Factories\AssetPhotoFactory> */
    use HasFactory, SoftDeletes;

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

        static::creating(function (AssetPhoto $assetPhoto): void {
            if (empty($assetPhoto->id)) {
                $assetPhoto->id = (string) Str::ulid();
            }
        });

        static::deleted(function (AssetPhoto $assetPhoto): void {
            Storage::disk('public')->delete($assetPhoto->file_path);
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'asset_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'caption',
        'is_primary',
    ];

    /**
     * Get the casts for the model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'is_primary' => 'boolean',
        ];
    }

    /**
     * Get the asset that owns the photo.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Scope a query to only include primary photos.
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Get the full URL for the photo.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * Mark this photo as the primary photo for the asset.
     */
    public function markAsPrimary(): void
    {
        $this->asset->photos()->update(['is_primary' => false]);
        $this->update(['is_primary' => true]);
    }
}
