<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Str;

/**
 * Asset Model
 *
 * @property string $id
 * @property int|null $id_aset
 * @property string|null $kd_brg
 * @property int|null $no_aset
 * @property string|null $kode_register
 * @property string|null $nama
 * @property string|null $merk
 * @property string|null $tipe
 * @property string|null $ur_sskel
 * @property int|null $kd_jns_bmn
 * @property string|null $kd_kondisi
 * @property string|null $ur_kondisi
 * @property string|null $kd_status
 * @property string|null $ur_status
 * @property string|null $tercatat
 * @property float|null $rph_aset
 * @property float|null $rph_susut
 * @property float|null $rph_buku
 * @property float|null $rph_perolehan
 * @property \DateTime|null $tgl_perlh
 * @property \DateTime|null $tgl_rekam
 * @property \DateTime|null $tgl_rekam_pertama
 * @property string|null $lokasi_ruang
 * @property string|null $lokasi_id
 * @property string|null $asl_perlh
 * @property string|null $kd_satker
 * @property string|null $ur_satker
 * @property int|null $jml_photo
 * @property int|null $umur_sisa
 * @property string|null $penanggung_jawab_id
 */
class Asset extends Model
{
    /** @use HasFactory<\Database\Factories\AssetFactory> */
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

        static::creating(function (Asset $asset): void {
            if (empty($asset->id)) {
                $asset->id = (string) Str::ulid();
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_aset',
        'kd_brg',
        'no_aset',
        'kode_register',
        'nama',
        'merk',
        'tipe',
        'ur_sskel',
        'kd_jns_bmn',
        'kd_kondisi',
        'ur_kondisi',
        'kd_status',
        'ur_status',
        'tercatat',
        'rph_aset',
        'rph_susut',
        'rph_buku',
        'rph_perolehan',
        'tgl_perlh',
        'tgl_rekam',
        'tgl_rekam_pertama',
        'lokasi_ruang',
        'lokasi_id',
        'asl_perlh',
        'kd_satker',
        'ur_satker',
        'jml_photo',
        'umur_sisa',
        'penanggung_jawab_id',
    ];

    /**
     * Get the casts for the model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id_aset' => 'integer',
            'no_aset' => 'integer',
            'kd_jns_bmn' => 'integer',
            'jml_photo' => 'integer',
            'umur_sisa' => 'integer',
            'rph_aset' => 'decimal:2',
            'rph_susut' => 'decimal:2',
            'rph_buku' => 'decimal:2',
            'rph_perolehan' => 'decimal:2',
            'tgl_perlh' => 'date',
            'tgl_rekam' => 'date',
            'tgl_rekam_pertama' => 'date',
        ];
    }

    /**
     * Get the location that owns the asset.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'lokasi_id');
    }

    /**
     * Get the handler (user) that owns the asset.
     */
    public function penanggungJawab(): BelongsTo
    {
        return $this->belongsTo(User::class, 'penanggung_jawab_id');
    }

    /**
     * Get the histories for the asset.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(AssetHistory::class);
    }

    /**
     * Get the maintenances for the asset.
     */
    public function maintenances(): HasMany
    {
        return $this->hasMany(AssetMaintenance::class);
    }

    /**
     * Get the condition logs for the asset.
     */
    public function conditionLogs(): HasMany
    {
        return $this->hasMany(AssetConditionLog::class);
    }

    /**
     * Get the photos for the asset.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(AssetPhoto::class);
    }

    /**
     * Scope a query to only include assets with a specific condition.
     */
    public function scopeByCondition($query, string $condition)
    {
        return $query->where('kd_kondisi', $condition);
    }

    /**
     * Scope a query to only include assets at a specific location.
     */
    public function scopeByLocation($query, string $locationId)
    {
        return $query->where('lokasi_id', $locationId);
    }

    /**
     * Scope a query to only include assets with a specific status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('kd_status', $status);
    }

    /**
     * Scope a query to search assets by name or code.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('nama', 'like', "%{$term}%")
                ->orWhere('kd_brg', 'like', "%{$term}%");
        });
    }
}
