<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Import data aset dari docs/data_simplified.json
     */
    public function run(): void
    {
        $jsonPath = base_path('docs/data_simplified.json');

        if (! file_exists($jsonPath)) {
            $this->command->warn('File data_simplified.json tidak ditemukan di: '.$jsonPath);
            $this->command->info('Melewati AssetSeeder...');

            return;
        }

        $jsonData = json_decode(file_get_contents($jsonPath), true);

        if (! isset($jsonData['data']) && ! isset($jsonData['aset'])) {
            $this->command->warn('Format file data_simplified.json tidak valid. Key "data" atau "aset" tidak ditemukan.');

            return;
        }

        // Use 'data' key, or fallback to 'aset'
        $assetData = $jsonData['data'] ?? $jsonData['aset'] ?? [];
        $totalAssets = is_countable($assetData) ? count($assetData) : 0;

        if ($totalAssets === 0) {
            $this->command->warn('Tidak ada data aset untuk diimport.');

            return;
        }

        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info("Memulai Import {$totalAssets} Aset...");
        $this->command->info('========================================');

        DB::beginTransaction();

        try {
            // Get all locations for mapping
            $locations = Location::all()->keyBy('nama_ruangan');
            $this->command->line('  <fg=blue>✓</> Loaded '.count($locations).' locations for mapping');

            $createdCount = 0;
            $updatedCount = 0;
            $errorCount = 0;
            $skipCount = 0;

            foreach ($assetData as $index => $item) {
                try {
                    // Extract and map data fields
                    $idAset = $item['id_aset'] ?? null;
                    $kdBrg = $item['kd_brg'] ?? null;
                    $noAset = $item['no_aset'] ?? null;
                    $kodeRegister = $item['kode_register'] ?? null;
                    $nama = $item['nama'] ?? null;
                    $merk = $item['merk'] ?? null;
                    $tipe = $item['tipe'] ?? null;
                    $urSskel = $item['ur_sskel'] ?? null;
                    $kdJnsBmn = $item['kd_jns_bmn'] ?? null;
                    $kdKondisi = $item['kd_kondisi'] ?? null;
                    $urKondisi = $item['ur_kondisi'] ?? null;
                    $kdStatus = $item['kd_status'] ?? null;
                    $urStatus = $item['ur_status'] ?? null;
                    $tercatat = $item['tercatat'] ?? null;
                    $rphAset = $this->parseNumeric($item['rph_aset'] ?? null);
                    $rphSusut = $this->parseNumeric($item['rph_susut'] ?? null);
                    $rphBuku = $this->parseNumeric($item['rph_buku'] ?? null);
                    $rphPerolehan = $this->parseNumeric($item['rph_perolehan'] ?? null);
                    $tglPerlh = $this->parseDate($item['tgl_perlh'] ?? null);
                    $tglRekam = $this->parseDate($item['tgl_rekam'] ?? null);
                    $tglRekamPertama = $this->parseDate($item['tgl_rekam_pertama'] ?? null);
                    $lokasiRuang = $item['lokasi_ruang'] ?? null;
                    $aslPerlh = $item['asl_perlh'] ?? null;
                    $kdSatker = $item['kd_satker'] ?? null;
                    $urSatker = $item['ur_satker'] ?? null;
                    $jmlPhoto = $item['jml_photo'] ?? null;
                    $umurSisa = $item['umur_sisa'] ?? null;

                    // Skip if essential fields are missing
                    if (! $nama && ! $kdBrg) {
                        $skipCount++;
                        $this->command->warn("  <fg=yellow>⊘</> Skip data #{$index}: Nama dan Kode Barang kosong.");

                        continue;
                    }

                    // Map lokasi_ruang to lokasi_id
                    $lokasiId = null;
                    if ($lokasiRuang) {
                        $location = $locations->firstWhere('nama_ruangan', $lokasiRuang);
                        if ($location) {
                            $lokasiId = $location->id;
                        } else {
                            // Try partial match
                            $location = $locations->first(function ($loc) use ($lokasiRuang) {
                                return str_contains($loc->nama_ruangan, $lokasiRuang) ||
                                       str_contains($lokasiRuang, $loc->nama_ruangan);
                            });
                            $lokasiId = $location?->id;
                        }
                    }

                    // Check if asset exists (by kode_register or id_aset)
                    $existingAsset = null;
                    if ($kodeRegister) {
                        $existingAsset = Asset::where('kode_register', $kodeRegister)->first();
                    } elseif ($idAset) {
                        $existingAsset = Asset::where('id_aset', $idAset)->first();
                    }

                    $assetData = [
                        'id_aset' => $idAset,
                        'kd_brg' => $kdBrg,
                        'no_aset' => $noAset,
                        'kode_register' => $kodeRegister,
                        'nama' => $nama,
                        'merk' => $merk,
                        'tipe' => $tipe,
                        'ur_sskel' => $urSskel,
                        'kd_jns_bmn' => $kdJnsBmn,
                        'kd_kondisi' => $kdKondisi,
                        'ur_kondisi' => $urKondisi,
                        'kd_status' => $kdStatus,
                        'ur_status' => $urStatus,
                        'tercatat' => $tercatat,
                        'rph_aset' => $rphAset,
                        'rph_susut' => $rphSusut,
                        'rph_buku' => $rphBuku,
                        'rph_perolehan' => $rphPerolehan,
                        'tgl_perlh' => $tglPerlh,
                        'tgl_rekam' => $tglRekam,
                        'tgl_rekam_pertama' => $tglRekamPertama,
                        'lokasi_ruang' => $lokasiRuang,
                        'lokasi_id' => $lokasiId,
                        'asl_perlh' => $aslPerlh,
                        'kd_satker' => $kdSatker,
                        'ur_satker' => $urSatker,
                        'jml_photo' => $jmlPhoto,
                        'umur_sisa' => $umurSisa,
                    ];

                    if ($existingAsset) {
                        // Update existing asset
                        $existingAsset->update($assetData);
                        $updatedCount++;
                        $this->command->line("  <fg=blue>○</> Update: {$nama} ({$kodeRegister})");
                    } else {
                        // Create new asset
                        Asset::create($assetData);
                        $createdCount++;
                        $this->command->line("  <fg=green>✓</> Created: {$nama} ({$kodeRegister})");
                    }
                } catch (\Exception $e) {
                    $errorCount++;
                    $nama = $item['nama'] ?? 'Unknown';
                    $this->command->error("  <fg=red>✗</> Error processing {$nama}: {$e->getMessage()}");
                }
            }

            DB::commit();

            $this->command->newLine();
            $this->command->info('========================================');
            $this->command->info('Import Aset Selesai!');
            $this->command->info('========================================');
            $this->command->line("  Total aset: {$totalAssets}");
            $this->command->line("  <fg=green>Created:</fg=green> {$createdCount}");
            $this->command->line("  <fg=blue>Updated:</fg=blue> {$updatedCount}");
            $this->command->line("  <fg=yellow>Skipped:</fg=yellow> {$skipCount}");
            $this->command->line("  <fg=red>Errors:</fg=red> {$errorCount}");
            $this->command->info('========================================');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Terjadi kesalahan saat seeding: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Parse numeric value from string (handle Indonesian format).
     */
    protected function parseNumeric(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        // Remove dots (thousand separator) and replace comma with dot
        $cleaned = str_replace('.', '', (string) $value);
        $cleaned = str_replace(',', '.', $cleaned);

        $numeric = filter_var($cleaned, FILTER_VALIDATE_FLOAT);

        return $numeric === false ? null : $numeric;
    }

    /**
     * Parse date value.
     */
    protected function parseDate(mixed $value): ?\DateTime
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            if (is_string($value)) {
                return new \DateTime($value);
            }

            return $value;
        } catch (\Exception $e) {
            return null;
        }
    }
}
