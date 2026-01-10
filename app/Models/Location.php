<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

/**
 * Location Model
 *
 * @property string $id
 * @property string $nama_ruangan
 * @property string|null $gedung
 * @property int|null $lantai
 * @property int $kapasitas
 * @property string|null $keterangan
 */
class Location extends Model
{
    /** @use HasFactory<\Database\Factories\LocationFactory> */
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

        static::creating(function (Location $location): void {
            if (empty($location->id)) {
                $location->id = (string) Str::ulid();
            }
        });
    }

    protected $fillable = [
        'nama_ruangan',
        'gedung',
        'lantai',
        'kapasitas',
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
            'lantai' => 'integer',
            'kapasitas' => 'integer',
        ];
    }
}
