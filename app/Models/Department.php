<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

class Department extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nama_unit',
        'singkat',
        'kepala_unit',
    ];

    /**
     * The "booting" method of the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Department $department): void {
            if (empty($department->id)) {
                $department->id = (string) Str::ulid();
            }
        });
    }
}
