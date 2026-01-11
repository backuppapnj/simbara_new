<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OfficeSupplyRequest extends FormRequest
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
        $supplyId = $this->route('office_supply')?->id;

        return [
            'nama_barang' => ['required', 'string', 'max:255'],
            'satuan' => ['required', 'string', 'max:20'],
            'kategori' => ['required', 'string', 'max:100', Rule::in(['Consumables', 'Cleaning Supplies', 'Operational'])],
            'deskripsi' => ['nullable', 'string'],
            'stok' => ['nullable', 'integer', 'min:0'],
            'stok_minimal' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * Get custom error messages for validator.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama_barang.required' => 'Nama barang wajib diisi.',
            'nama_barang.max' => 'Nama barang maksimal 255 karakter.',
            'satuan.required' => 'Satuan wajib diisi.',
            'satuan.max' => 'Satuan maksimal 20 karakter.',
            'kategori.required' => 'Kategori wajib diisi.',
            'kategori.in' => 'Kategori harus salah satu dari: Consumables, Cleaning Supplies, Operational.',
            'stok.integer' => 'Stok harus berupa angka.',
            'stok.min' => 'Stok tidak boleh negatif.',
            'stok_minimal.integer' => 'Stok minimal harus berupa angka.',
            'stok_minimal.min' => 'Stok minimal tidak boleh negatif.',
        ];
    }
}
