# Test Fixtures

This directory contains test files for E2E testing.

## Asset Import Fixtures

JSON fixture files for testing the Asset Import (SIMAN JSON) feature.

### File Descriptions / Deskripsi File

#### Valid Data Files

- **`assets-import-valid.json`** - Valid JSON with 3 complete asset records. Used for testing successful import flow.

- **`assets-import-large.json`** - Contains 10 asset records to test large file handling and pagination.

#### Error Cases Files

- **`assets-import-empty.json`** - Empty data array. Tests handling of files with no records.

- **`assets-import-malformed.json`** - Invalid JSON syntax (missing comma). Tests JSON parsing error handling.

- **`assets-import-missing-fields.json`** - Records missing required fields like `rph_aset`, `kd_kondisi`, etc. Tests validation errors.

- **`assets-import-with-errors.json`** - Mix of valid and invalid records. Tests error row highlighting in preview.

#### Special Cases Files

- **`assets-import-duplicates.json`** - Contains duplicate `id_aset` values to test update vs create logic.

- **`assets-import-existing-codes.json`** - Uses asset codes that may already exist in database. Tests update flow.

- **`assets-import-invalid-category.json`** - Contains invalid category codes and missing categories.

- **`assets-import-special-chars.json`** - Tests handling of special characters: `&`, `"`, `'`, `<`, `>`, `/`, `(`, `)`.

- **`assets-import-null-values.json`** - Mix of `null`, empty strings `""`, and valid values for optional fields.

- **`assets-import-unicode.json`** - Tests Unicode characters from various languages: Chinese (京東方), Arabic (العربية), Ukrainian (для презентації), Hebrew (ארון), Hindi (मुंबई).

- **`assets-import-invalid-dates.json`** - Various invalid date formats: `2024/13/01`, `01-01-2024`, `invalid-date-string`.

#### Other Files

- **`sample.pdf`** - Sample PDF file to test rejection of non-JSON file formats.

### JSON Structure Format

All asset import fixtures follow this structure:

```json
{
  "metadata": {
    "generated_at": "ISO 8601 timestamp",
    "total_records": "number of records",
    "source": "SIMAN",
    "fields": ["array of field names"]
  },
  "data": [
    {
      "id_aset": "integer - Required - Unique asset identifier",
      "kd_brg": "string - Required - Commodity code",
      "no_aset": "integer|null - Asset number",
      "kode_register": "string|null - Registration code",
      "nama": "string - Required - Asset name",
      "merk": "string|null - Brand",
      "tipe": "string|null - Type/Model",
      "ur_sskel": "string|null - Description",
      "kd_jns_bmn": "string|null - BMN type code",
      "kd_kondisi": "string - Required - Condition code (1=Baik, 2=Rusak Ringan, 3=Rusak Berat)",
      "ur_kondisi": "string|null - Condition description",
      "kd_status": "string|null - Status code",
      "ur_status": "string|null - Status description",
      "tercatat": "string|null - Recorded status",
      "rph_aset": "number - Required - Asset value (rupiah)",
      "rph_susut": "number|null - Depreciation value",
      "rph_buku": "number|null - Book value",
      "rph_perolehan": "number|null - Acquisition value",
      "tgl_perlh": "date|string|null - Acquisition date",
      "tgl_rekam": "date|string|null - Record date",
      "tgl_rekam_pertama": "date|string|null - First record date",
      "lokasi_ruang": "string|null - Room location",
      "asl_perlh": "string|null - Acquisition method",
      "kd_satker": "string|null - Satker code",
      "ur_satker": "string|null - Satker name",
      "jml_photo": "integer|null - Number of photos",
      "umur_sisa": "integer|null - Remaining useful life"
    }
  ]
}
```

### Required Fields / Bidang Wajib

According to `AssetImportService.php`, the following fields are required:
- `id_aset` - Asset ID
- `kd_brg` - Commodity code
- `nama` - Asset name
- `kd_kondisi` - Condition code
- `rph_aset` - Asset value

### Validation Rules

Based on `ImportAssetRequest.php`:
- File must be JSON format (`.json` extension)
- Maximum file size: 10MB (10240 KB)
- Must contain `metadata` and `data` keys
- `data` must be an array

Based on `AssetImportService.php`:
- Each record must have required fields
- Duplicate `id_aset` values will update existing records
- New `id_aset` values will create new records
- Invalid `lokasi_ruang` will auto-create new location

## Test Images

- `test-image-valid.jpg` - Valid JPG image for upload testing
- `test-image-large.jpg` - Large image (>5MB) for file size validation testing
- `test-image-invalid.txt` - Non-image file for validation testing

### How to Generate Test Images

#### Create a valid test image (JPG):
```bash
convert -size 800x600 xc:blue tests/e2e/fixtures/test-image-valid.jpg
# Or using ImageMagick
convert -size 800x600 xc:blue tests/e2e/fixtures/test-image-valid.jpg
```

#### Create a large test image (>5MB):
```bash
# Create a 4000x3000 image which will be >5MB
convert -size 4000x3000 xc:blue -quality 100 tests/e2e/fixtures/test-image-large.jpg
```

## Quick Setup

Run this command to generate test fixtures:

```bash
# Requires ImageMagick
convert -size 800x600 xc:blue tests/e2e/fixtures/test-image-valid.jpg
convert -size 4000x3000 xc:blue -quality 100 tests/e2e/fixtures/test-image-large.jpg
echo "This is not an image" > tests/e2e/fixtures/test-image-invalid.txt
```

Or download sample images from the web.
