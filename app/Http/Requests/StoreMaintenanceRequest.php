<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'jenis_perawatan' => ['required', 'string', 'in:Preventive,Corrective,Rehab'],
            'tanggal' => ['required', 'date'],
            'biaya' => ['nullable', 'numeric', 'min:0'],
            'pelaksana' => ['required', 'string', 'max:100'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
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
            'jenis_perawatan.required' => 'Jenis perawatan harus diisi',
            'jenis_perawatan.in' => 'Jenis perawatan harus salah satu dari: Preventive, Corrective, Rehab',
            'tanggal.required' => 'Tanggal harus diisi',
            'tanggal.date' => 'Format tanggal tidak valid',
            'biaya.numeric' => 'Biaya harus berupa angka',
            'biaya.min' => 'Biaya tidak boleh negatif',
            'pelaksana.required' => 'Pelaksana harus diisi',
            'pelaksana.max' => 'Nama pelaksana maksimal 100 karakter',
            'keterangan.max' => 'Keterangan maksimal 1000 karakter',
        ];
    }
}
