<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Asset;
use App\Models\Location;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AssetImportService
{
    /**
     * Import assets from SIMAN JSON data.
     *
     * @param  array{metadata: array, data: array}  $data
     * @return array{success: int, errors: int, error_details: array, total: int}
     */
    public function import(array $data): array
    {
        $this->validateJsonStructure($data);

        $records = $data['data'] ?? [];
        $totalRecords = count($records);
        $chunkSize = 100;

        $successCount = 0;
        $errorCount = 0;
        $errorDetails = [];

        // Process in chunks
        $chunks = array_chunk($records, $chunkSize);

        foreach ($chunks as $chunkIndex => $chunk) {
            try {
                DB::beginTransaction();

                foreach ($chunk as $index => $record) {
                    $globalIndex = ($chunkIndex * $chunkSize) + $index;

                    try {
                        $this->importSingleRecord($record);
                        $successCount++;
                    } catch (\Exception $e) {
                        $errorCount++;
                        $errorDetails[] = [
                            'row' => $globalIndex + 1,
                            'id_aset' => $record['id_aset'] ?? 'unknown',
                            'nama' => $record['nama'] ?? 'unknown',
                            'error' => $e->getMessage(),
                        ];
                        Log::warning('Failed to import asset record', [
                            'row' => $globalIndex + 1,
                            'error' => $e->getMessage(),
                            'record' => $record,
                        ]);
                    }
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Failed to import chunk', [
                    'chunk' => $chunkIndex,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        }

        return [
            'success' => $successCount,
            'errors' => $errorCount,
            'error_details' => $errorDetails,
            'total' => $totalRecords,
        ];
    }

    /**
     * Validate JSON structure.
     *
     * @param  array{metadata?: mixed, data?: mixed}  $data
     * @return array{metadata: array, data: array}
     *
     * @throws ValidationException
     */
    protected function validateJsonStructure(array $data): array
    {
        if (! isset($data['metadata'])) {
            throw ValidationException::withMessages(['json' => 'Invalid JSON format: missing "metadata" key']);
        }

        if (! isset($data['data']) || ! is_array($data['data'])) {
            throw ValidationException::withMessages(['json' => 'Invalid JSON format: missing or invalid "data" key']);
        }

        return $data;
    }

    /**
     * Import a single asset record.
     */
    protected function importSingleRecord(array $record): void
    {
        $this->validateRequiredFields($record);

        // Map lokasi_ruang to lokasi_id
        $lokasiId = $this->mapLocation($record['lokasi_ruang'] ?? null);

        // Check for duplicates
        $existingAsset = Asset::where('id_aset', $record['id_aset'])->first();

        if ($existingAsset) {
            // Update existing asset
            $existingAsset->update(array_merge(
                $this->mapAssetData($record, $lokasiId),
                ['updated_at' => now()]
            ));
        } else {
            // Create new asset
            Asset::create($this->mapAssetData($record, $lokasiId));
        }
    }

    /**
     * Validate required fields for a single record.
     *
     * @throws ValidationException
     */
    protected function validateRequiredFields(array $record): void
    {
        $required = ['id_aset', 'kd_brg', 'nama', 'kd_kondisi', 'rph_aset'];

        foreach ($required as $field) {
            if (! isset($record[$field]) || $record[$field] === '' || $record[$field] === null) {
                throw ValidationException::withMessages([$field => "Missing required field: {$field}"]);
            }
        }
    }

    /**
     * Map lokasi_ruang to lokasi_id, creating location if not exists.
     */
    protected function mapLocation(?string $lokasiRuang): ?string
    {
        if (empty($lokasiRuang)) {
            return null;
        }

        $location = Location::where('nama_ruangan', $lokasiRuang)->first();

        if ($location) {
            return $location->id;
        }

        // Create new location
        $newLocation = Location::create([
            'id' => (string) Str::ulid(),
            'nama_ruangan' => $lokasiRuang,
            'gedung' => 'Unknown',
            'lantai' => 1,
            'kapasitas' => 100,
        ]);

        return $newLocation->id;
    }

    /**
     * Map SIMAN data to Asset model fields.
     */
    protected function mapAssetData(array $record, ?string $lokasiId): array
    {
        return [
            'id_aset' => $record['id_aset'],
            'kd_brg' => $record['kd_brg'],
            'no_aset' => $record['no_aset'] ?? null,
            'kode_register' => $record['kode_register'] ?? null,
            'nama' => $record['nama'],
            'merk' => $record['merk'] ?? null,
            'tipe' => $record['tipe'] ?? null,
            'ur_sskel' => $record['ur_sskel'] ?? null,
            'kd_jns_bmn' => $record['kd_jns_bmn'] ?? null,
            'kd_kondisi' => $record['kd_kondisi'],
            'ur_kondisi' => $record['ur_kondisi'] ?? null,
            'kd_status' => $record['kd_status'] ?? null,
            'ur_status' => $record['ur_status'] ?? null,
            'tercatat' => $record['tercatat'] ?? null,
            'rph_aset' => $record['rph_aset'],
            'rph_susut' => $record['rph_susut'] ?? 0,
            'rph_buku' => $record['rph_buku'] ?? $record['rph_aset'],
            'rph_perolehan' => $record['rph_perolehan'] ?? $record['rph_aset'],
            'tgl_perlh' => $record['tgl_perlh'] ?? null,
            'tgl_rekam' => $record['tgl_rekam'] ?? null,
            'tgl_rekam_pertama' => $record['tgl_rekam_pertama'] ?? null,
            'lokasi_ruang' => $record['lokasi_ruang'] ?? null,
            'lokasi_id' => $lokasiId,
            'asl_perlh' => $record['asl_perlh'] ?? null,
            'kd_satker' => $record['kd_satker'] ?? null,
            'ur_satker' => $record['ur_satker'] ?? null,
            'jml_photo' => $record['jml_photo'] ?? 0,
            'umur_sisa' => $record['umur_sisa'] ?? 0,
        ];
    }

    /**
     * Get preview of data (first 50 records).
     *
     * @param  array{metadata: array, data: array}  $data
     * @return Collection<int, array>
     */
    public function getPreview(array $data): Collection
    {
        $this->validateJsonStructure($data);

        return collect($data['data'])->take(50);
    }

    /**
     * Get metadata from JSON data.
     *
     * @param  array{metadata: array, data: array}  $data
     * @return array{generated_at: string, total_records: int, fields: array}
     */
    public function getMetadata(array $data): array
    {
        $this->validateJsonStructure($data);

        return [
            'generated_at' => $data['metadata']['generated_at'] ?? now()->toISOString(),
            'total_records' => $data['metadata']['total_records'] ?? count($data['data']),
            'fields' => $data['metadata']['fields'] ?? [],
        ];
    }

    // Static methods for testing

    /**
     * Static method to validate JSON structure from string (for testing).
     *
     * @return true|array{metadata: array, data: array}
     *
     * @throws ValidationException
     */
    public static function validateJsonString(string $json): bool|array
    {
        $data = json_decode($json, true);

        if (! isset($data['metadata'])) {
            throw ValidationException::withMessages(['json' => 'Invalid JSON format: missing "metadata" key']);
        }

        if (! isset($data['data'])) {
            throw ValidationException::withMessages(['json' => 'Invalid JSON format: missing "data" key']);
        }

        return $data;
    }

    /**
     * Static method to validate a single record (for testing).
     *
     * @return true
     *
     * @throws ValidationException
     */
    public static function validateRecord(array $record): bool
    {
        $required = ['id_aset', 'kd_brg', 'no_aset', 'kode_register', 'nama', 'kd_kondisi', 'ur_kondisi', 'rph_aset'];

        foreach ($required as $field) {
            if (! isset($record[$field]) || $record[$field] === '' || $record[$field] === null) {
                throw ValidationException::withMessages([$field => "Missing required field: {$field}"]);
            }
        }

        return true;
    }

    /**
     * Static method to find or create location (for testing).
     */
    public static function findOrCreateLocation(string $locationName): Location
    {
        $location = Location::where('nama_ruangan', $locationName)->first();

        if ($location) {
            return $location;
        }

        return Location::create([
            'id' => (string) Str::ulid(),
            'nama_ruangan' => $locationName,
            'gedung' => 'Unknown',
            'lantai' => 1,
            'kapasitas' => 100,
        ]);
    }

    /**
     * Static method to process import (for testing).
     *
     * @param  array<int, array>  $data
     * @return array{success: int, errors: array<int, array>, total: int}
     */
    public static function processImport(array $data): array
    {
        $successCount = 0;
        $errorDetails = [];

        foreach ($data as $index => $record) {
            try {
                self::validateRecord($record);

                $lokasiId = null;
                if (! empty($record['lokasi_ruang'])) {
                    $location = self::findOrCreateLocation($record['lokasi_ruang']);
                    $lokasiId = $location->id;
                }

                $mappedData = self::mapRecordData($record, $lokasiId);
                Asset::create($mappedData);
                $successCount++;
            } catch (\Exception $e) {
                $errorDetails[] = [
                    'row' => $index + 1,
                    'id_aset' => $record['id_aset'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return [
            'success' => $successCount,
            'errors' => $errorDetails,
            'total' => count($data),
        ];
    }

    /**
     * Static method to map record data (for testing).
     */
    protected static function mapRecordData(array $record, ?string $lokasiId): array
    {
        return [
            'id_aset' => $record['id_aset'],
            'kd_brg' => $record['kd_brg'],
            'no_aset' => $record['no_aset'] ?? null,
            'kode_register' => $record['kode_register'] ?? null,
            'nama' => $record['nama'],
            'merk' => $record['merk'] ?? null,
            'tipe' => $record['tipe'] ?? null,
            'ur_sskel' => $record['ur_sskel'] ?? null,
            'kd_jns_bmn' => $record['kd_jns_bmn'] ?? null,
            'kd_kondisi' => $record['kd_kondisi'],
            'ur_kondisi' => $record['ur_kondisi'] ?? null,
            'kd_status' => $record['kd_status'] ?? null,
            'ur_status' => $record['ur_status'] ?? null,
            'tercatat' => $record['tercatat'] ?? null,
            'rph_aset' => $record['rph_aset'],
            'rph_susut' => $record['rph_susut'] ?? 0,
            'rph_buku' => $record['rph_buku'] ?? $record['rph_aset'],
            'rph_perolehan' => $record['rph_perolehan'] ?? $record['rph_aset'],
            'tgl_perlh' => $record['tgl_perlh'] ?? null,
            'tgl_rekam' => $record['tgl_rekam'] ?? null,
            'tgl_rekam_pertama' => $record['tgl_rekam_pertama'] ?? null,
            'lokasi_ruang' => $record['lokasi_ruang'] ?? null,
            'lokasi_id' => $lokasiId,
            'asl_perlh' => $record['asl_perlh'] ?? null,
            'kd_satker' => $record['kd_satker'] ?? null,
            'ur_satker' => $record['ur_satker'] ?? null,
            'jml_photo' => $record['jml_photo'] ?? 0,
            'umur_sisa' => $record['umur_sisa'] ?? 0,
        ];
    }
}
