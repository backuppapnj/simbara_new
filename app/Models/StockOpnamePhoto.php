<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class StockOpnamePhoto extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'stock_opname_detail_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'sequence',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (StockOpnamePhoto $photo): void {
            if (empty($photo->id)) {
                $photo->id = (string) Str::ulid();
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
            'file_size' => 'integer',
            'sequence' => 'integer',
        ];
    }

    /**
     * Get the stock opname detail that owns the photo.
     */
    public function stockOpnameDetail(): BelongsTo
    {
        return $this->belongsTo(StockOpnameDetail::class);
    }

    /**
     * Get the full URL for the photo.
     */
    public function getUrlAttribute(): string
    {
        return storage_path('app/public/'.$this->file_path);
    }
}
