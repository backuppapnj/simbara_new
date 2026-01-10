<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
    use SoftDeletes;

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
