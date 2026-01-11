<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AtkReportFilterRequest extends FormRequest
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
            'start_date' => ['nullable', 'date', 'before_or_equal:end_date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'bulan' => ['nullable', 'integer', 'min:1', 'max:12'],
            'tahun' => ['nullable', 'integer', 'min:2020', 'max:2099'],
            'user_id' => ['nullable', 'string', 'exists:users,id'],
            'department_id' => ['nullable', 'string', 'exists:departments,id'],
            'supplier' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:pending,level1_approved,level2_approved,level3_approved,rejected,diserahkan,diterima'],
            'jenis_mutasi' => ['nullable', 'string', 'in:masuk,keluar,adjustment'],
            'item_id' => ['nullable', 'string', 'exists:items,id'],
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
            'start_date.before_or_equal' => 'Tanggal awal harus sebelum atau sama dengan tanggal akhir.',
            'end_date.after_or_equal' => 'Tanggal akhir harus setelah atau sama dengan tanggal awal.',
            'bulan.min' => 'Bulan harus antara 1-12.',
            'bulan.max' => 'Bulan harus antara 1-12.',
            'tahun.min' => 'Tahun tidak valid.',
            'tahun.max' => 'Tahun tidak valid.',
            'user_id.exists' => 'User tidak ditemukan.',
            'department_id.exists' => 'Departemen tidak ditemukan.',
            'item_id.exists' => 'Item tidak ditemukan.',
            'status.in' => 'Status tidak valid.',
            'jenis_mutasi.in' => 'Jenis mutasi harus salah satu dari: masuk, keluar, adjustment.',
        ];
    }
}
