<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Asset;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class AssetExportService
{
    /**
     * Generate CSV export for assets in SAKTI/SIMAN format.
     */
    public function exportAssetsToSaktiSimanFormat(Collection $assets): string
    {
        $headers = [
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
            'asl_perlh',
            'kd_satker',
            'ur_satker',
            'jml_photo',
            'umur_sisa',
        ];

        $csv = implode(',', $headers)."\n";

        foreach ($assets as $asset) {
            $row = [
                $asset->id_aset ?? '',
                $this->escapeCsvField($asset->kd_brg),
                $asset->no_aset ?? '',
                $this->escapeCsvField($asset->kode_register),
                $this->escapeCsvField($asset->nama),
                $this->escapeCsvField($asset->merk),
                $this->escapeCsvField($asset->tipe),
                $this->escapeCsvField($asset->ur_sskel),
                $asset->kd_jns_bmn ?? '',
                $asset->kd_kondisi ?? '',
                $this->escapeCsvField($asset->ur_kondisi),
                $this->escapeCsvField($asset->kd_status),
                $this->escapeCsvField($asset->ur_status),
                $this->escapeCsvField($asset->tercatat),
                $asset->rph_aset ?? 0,
                $asset->rph_susut ?? 0,
                $asset->rph_buku ?? 0,
                $asset->rph_perolehan ?? 0,
                $asset->tgl_perlh?->format('Y-m-d') ?? '',
                $asset->tgl_rekam?->format('Y-m-d') ?? '',
                $asset->tgl_rekam_pertama?->format('Y-m-d') ?? '',
                $this->escapeCsvField($asset->lokasi_ruang),
                $this->escapeCsvField($asset->asl_perlh),
                $this->escapeCsvField($asset->kd_satker),
                $this->escapeCsvField($asset->ur_satker),
                $asset->jml_photo ?? 0,
                $asset->umur_sisa ?? 0,
            ];

            $csv .= implode(',', $row)."\n";
        }

        return $csv;
    }

    /**
     * Generate CSV export for assets grouped by location.
     */
    public function exportByLocation(Collection $assets): string
    {
        $headers = [
            'Lokasi',
            'Kode Barang',
            'Nama Aset',
            'Kondisi',
            'Nilai Aset',
            'Nilai Buku',
        ];

        $csv = implode(',', $headers)."\n";

        $grouped = $assets->sortBy('lokasi_ruang')->groupBy('lokasi_ruang');

        foreach ($grouped as $location => $locationAssets) {
            foreach ($locationAssets as $asset) {
                $row = [
                    $this->escapeCsvField($location),
                    $this->escapeCsvField($asset->kd_brg),
                    $this->escapeCsvField($asset->nama),
                    $this->escapeCsvField($asset->ur_kondisi),
                    $asset->rph_aset ?? 0,
                    $asset->rph_buku ?? 0,
                ];

                $csv .= implode(',', $row)."\n";
            }
        }

        return $csv;
    }

    /**
     * Generate CSV export for assets grouped by category (14-digit Kemenkeu).
     */
    public function exportByCategory(Collection $assets): string
    {
        $headers = [
            'Kode Barang',
            'Uraian Sub Kelompok',
            'Nama Aset',
            'Kondisi',
            'Nilai Aset',
            'Nilai Buku',
        ];

        $csv = implode(',', $headers)."\n";

        $grouped = $assets->sortBy('kd_brg')->groupBy('kd_brg');

        foreach ($grouped as $category => $categoryAssets) {
            foreach ($categoryAssets as $asset) {
                $row = [
                    $this->escapeCsvField($category),
                    $this->escapeCsvField($asset->ur_sskel),
                    $this->escapeCsvField($asset->nama),
                    $this->escapeCsvField($asset->ur_kondisi),
                    $asset->rph_aset ?? 0,
                    $asset->rph_buku ?? 0,
                ];

                $csv .= implode(',', $row)."\n";
            }
        }

        return $csv;
    }

    /**
     * Generate CSV export for assets grouped by condition.
     */
    public function exportByCondition(Collection $assets): string
    {
        $headers = [
            'Kondisi',
            'Kode Barang',
            'Nama Aset',
            'Lokasi',
            'Nilai Aset',
            'Nilai Buku',
        ];

        $csv = implode(',', $headers)."\n";

        $grouped = $assets->sortBy('ur_kondisi')->groupBy('ur_kondisi');

        foreach ($grouped as $condition => $conditionAssets) {
            foreach ($conditionAssets as $asset) {
                $row = [
                    $this->escapeCsvField($condition),
                    $this->escapeCsvField($asset->kd_brg),
                    $this->escapeCsvField($asset->nama),
                    $this->escapeCsvField($asset->lokasi_ruang),
                    $asset->rph_aset ?? 0,
                    $asset->rph_buku ?? 0,
                ];

                $csv .= implode(',', $row)."\n";
            }
        }

        return $csv;
    }

    /**
     * Generate CSV export for maintenance history.
     */
    public function exportMaintenanceHistory(Collection $maintenances): string
    {
        $headers = [
            'ID Aset',
            'Nama Aset',
            'Jenis Perawatan',
            'Tanggal',
            'Biaya',
            'Pelaksana',
            'Keterangan',
        ];

        $csv = implode(',', $headers)."\n";

        foreach ($maintenances as $maintenance) {
            $row = [
                $maintenance->asset->id_aset ?? '',
                $this->escapeCsvField($maintenance->asset->nama),
                $this->escapeCsvField($maintenance->jenis_perawatan),
                $maintenance->tanggal->format('Y-m-d'),
                $maintenance->biaya ?? 0,
                $this->escapeCsvField($maintenance->pelaksana),
                $this->escapeCsvField($maintenance->keterangan),
            ];

            $csv .= implode(',', $row)."\n";
        }

        return $csv;
    }

    /**
     * Generate CSV export for asset value summary per category.
     */
    public function exportValueSummary(Collection $assets): string
    {
        $headers = [
            'Kode Barang',
            'Uraian Sub Kelompok',
            'Jumlah Aset',
            'Total Nilai Aset',
            'Total Nilai Buku',
            'Rata-rata Nilai',
        ];

        $csv = implode(',', $headers)."\n";

        $grouped = $assets->sortBy('kd_brg')->groupBy('kd_brg');

        foreach ($grouped as $category => $categoryAssets) {
            $count = $categoryAssets->count();
            $totalNilaiAset = $categoryAssets->sum('rph_aset') ?? 0;
            $totalNilaiBuku = $categoryAssets->sum('rph_buku') ?? 0;
            $avgNilai = $count > 0 ? $totalNilaiAset / $count : 0;

            $firstAsset = $categoryAssets->first();

            $row = [
                $this->escapeCsvField($category),
                $this->escapeCsvField($firstAsset->ur_sskel),
                $count,
                $totalNilaiAset,
                $totalNilaiBuku,
                number_format($avgNilai, 2, '.', ''),
            ];

            $csv .= implode(',', $row)."\n";
        }

        return $csv;
    }

    /**
     * Escape CSV field if it contains special characters.
     */
    protected function escapeCsvField(?string $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        // Wrap in quotes if contains comma, newline, or quote
        if (str_contains($value, ',') || str_contains($value, "\n") || str_contains($value, '"')) {
            $value = str_replace('"', '""', $value);

            return '"'.$value.'"';
        }

        return $value;
    }

    /**
     * Get assets with filters applied.
     */
    public function getAssetsWithFilters(array $filters): Collection
    {
        $query = Asset::query()->with(['location', 'penanggungJawab']);

        // Filter by date range
        if (isset($filters['date_from'])) {
            $query->whereDate('tgl_rekam', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('tgl_rekam', '<=', $filters['date_to']);
        }

        // Filter by location
        if (isset($filters['lokasi_id'])) {
            $query->where('lokasi_id', $filters['lokasi_id']);
        }

        // Filter by category
        if (isset($filters['kd_brg'])) {
            $query->where('kd_brg', $filters['kd_brg']);
        }

        // Filter by condition
        if (isset($filters['kd_kondisi'])) {
            $query->where('kd_kondisi', $filters['kd_kondisi']);
        }

        return $query->get();
    }

    /**
     * Get maintenance history with filters applied.
     */
    public function getMaintenanceHistoryWithFilters(array $filters): Collection
    {
        $query = AssetMaintenance::query()->with(['asset']);

        // Filter by date range
        if (isset($filters['date_from'])) {
            $query->whereDate('tanggal', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('tanggal', '<=', $filters['date_to']);
        }

        // Filter by asset
        if (isset($filters['asset_id'])) {
            $query->where('asset_id', $filters['asset_id']);
        }

        return $query->orderBy('tanggal', 'desc')->get();
    }

    /**
     * Generate filename for export.
     */
    public function generateFilename(string $reportType, string $extension = 'csv'): string
    {
        $date = now()->format('Y-m-d_His');
        $slug = Str::slug($reportType);

        return "laporan-aset-{$slug}-{$date}.{$extension}";
    }
}
