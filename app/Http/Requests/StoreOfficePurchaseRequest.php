<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfficePurchaseRequest extends FormRequest
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
            'supplier' => ['required', 'string', 'max:100'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.supply_id' => ['required', 'exists:office_supplies,id'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
            'items.*.subtotal' => ['nullable', 'numeric', 'min:0'],
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
            'tanggal.required' => 'Tanggal pembelian wajib diisi.',
            'supplier.required' => 'Nama supplier wajib diisi.',
            'supplier.max' => 'Nama supplier maksimal 100 karakter.',
            'items.required' => 'Item barang wajib ditambahkan.',
            'items.array' => 'Format item tidak valid.',
            'items.min' => 'Minimal satu item barang harus ditambahkan.',
            'items.*.supply_id.required' => 'Item barang wajib dipilih.',
            'items.*.supply_id.exists' => 'Item barang tidak ditemukan.',
            'items.*.jumlah.required' => 'Jumlah wajib diisi.',
            'items.*.jumlah.integer' => 'Jumlah harus berupa angka.',
            'items.*.jumlah.min' => 'Jumlah minimal 1.',
            'items.*.subtotal.numeric' => 'Subtotal harus berupa angka.',
            'items.*.subtotal.min' => 'Subtotal tidak boleh negatif.',
        ];
    }
}
