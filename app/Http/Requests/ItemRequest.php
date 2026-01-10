<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ItemRequest extends FormRequest
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
        $itemId = $this->route('item')?->id;

        return [
            'kode_barang' => ['required', 'string', 'max:20', Rule::unique('items', 'kode_barang')->ignore($itemId)],
            'nama_barang' => 'required|string|max:255',
            'satuan' => 'required|string|max:20',
            'kategori' => 'nullable|string|max:100',
            'stok' => 'nullable|integer|min:0',
            'stok_minimal' => 'nullable|integer|min:0',
            'stok_maksimal' => 'nullable|integer|min:0',
            'harga_beli_terakhir' => 'nullable|numeric|min:0',
            'harga_rata_rata' => 'nullable|numeric|min:0',
            'harga_jual' => 'nullable|numeric|min:0',
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
            'kode_barang.required' => 'Kode barang wajib diisi.',
            'kode_barang.unique' => 'Kode barang sudah digunakan.',
            'nama_barang.required' => 'Nama barang wajib diisi.',
            'satuan.required' => 'Satuan wajib diisi.',
            'stok.integer' => 'Stok harus berupa angka.',
            'stok.min' => 'Stok tidak boleh negatif.',
            'stok_minimal.integer' => 'Stok minimal harus berupa angka.',
            'stok_minimal.min' => 'Stok minimal tidak boleh negatif.',
            'stok_maksimal.integer' => 'Stok maksimal harus berupa angka.',
            'stok_maksimal.min' => 'Stok maksimal tidak boleh negatif.',
            'harga_beli_terakhir.numeric' => 'Harga beli terakhir harus berupa angka.',
            'harga_beli_terakhir.min' => 'Harga beli terakhir tidak boleh negatif.',
            'harga_rata_rata.numeric' => 'Harga rata-rata harus berupa angka.',
            'harga_rata_rata.min' => 'Harga rata-rata tidak boleh negatif.',
            'harga_jual.numeric' => 'Harga jual harus berupa angka.',
            'harga_jual.min' => 'Harga jual tidak boleh negatif.',
        ];
    }
}
