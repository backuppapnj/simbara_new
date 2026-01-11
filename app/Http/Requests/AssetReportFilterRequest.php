<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssetReportFilterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        return [
            'date_from' => ['nullable', 'date', 'before_or_equal:date_to'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'lokasi_id' => ['nullable', 'string', 'exists:locations,id'],
            'kd_brg' => ['nullable', 'string', 'max:20'],
            'kd_kondisi' => ['nullable', 'string', 'in:1,2,3'],
            'asset_id' => ['nullable', 'string', 'exists:assets,id'],
            'report_type' => ['nullable', 'string', 'in:sakti_siman,by_location,by_category,by_condition,maintenance_history,value_summary'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date_from.before_or_equal' => 'Tanggal awal harus sebelum atau sama dengan tanggal akhir.',
            'date_to.after_or_equal' => 'Tanggal akhir harus setelah atau sama dengan tanggal awal.',
            'lokasi_id.exists' => 'Lokasi tidak ditemukan.',
            'kd_brg.max' => 'Kode barang maksimal 20 karakter.',
            'kd_kondisi.in' => 'Kondisi harus salah satu dari: 1 (Baik), 2 (Rusak Ringan), 3 (Rusak Berat).',
            'asset_id.exists' => 'Aset tidak ditemukan.',
            'report_type.in' => 'Tipe laporan tidak valid.',
        ];
    }
}
