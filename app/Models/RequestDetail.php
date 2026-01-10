<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class RequestDetail extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'request_id',
        'item_id',
        'jumlah_diminta',
        'jumlah_disetujui',
        'jumlah_diberikan',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (RequestDetail $detail): void {
            if (empty($detail->id)) {
                $detail->id = (string) Str::ulid();
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
            'jumlah_diminta' => 'integer',
            'jumlah_disetujui' => 'integer',
            'jumlah_diberikan' => 'integer',
        ];
    }

    /**
     * The request that owns the detail.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(AtkRequest::class, 'request_id');
    }

    /**
     * The item that belongs to the detail.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
