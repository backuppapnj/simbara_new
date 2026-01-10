<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreStockOpnameRequest extends FormRequest
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
            'tanggal' => ['required', 'date'],
            'periode_bulan' => ['required', 'string', 'max:20'],
            'periode_tahun' => ['required', 'integer', 'min:2020', 'max:2100'],
            'keterangan' => ['nullable', 'string'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.item_id' => ['required', 'string', 'exists:items,id'],
            'details.*.stok_sistem' => ['required', 'integer', 'min:0'],
            'details.*.stok_fisik' => ['required', 'integer', 'min:0'],
            'details.*.keterangan' => ['nullable', 'string'],
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
            'tanggal.required' => 'Tanggal stock opname wajib diisi.',
            'periode_bulan.required' => 'Periode bulan wajib diisi.',
            'periode_tahun.required' => 'Periode tahun wajib diisi.',
            'details.required' => 'Detail barang wajib diisi.',
            'details.min' => 'Minimal harus ada 1 barang.',
            'details.*.item_id.required' => 'Barang wajib dipilih.',
            'details.*.stok_sistem.required' => 'Stok sistem wajib diisi.',
            'details.*.stok_fisik.required' => 'Stok fisik wajib diisi.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            redirect()->back()
                ->withInput()
                ->withErrors($validator)
        );
    }
}
