<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAtkRequest extends FormRequest
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
            'department_id' => ['required', 'exists:departments,id'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.jumlah_diminta' => ['required', 'integer', 'min:1'],
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
            'tanggal.required' => 'Tanggal permintaan wajib diisi.',
            'department_id.required' => 'Departemen wajib dipilih.',
            'department_id.exists' => 'Departemen tidak ditemukan.',
            'items.required' => 'Item barang wajib ditambahkan.',
            'items.array' => 'Format item tidak valid.',
            'items.min' => 'Minimal satu item barang harus ditambahkan.',
            'items.*.item_id.required' => 'Item barang wajib dipilih.',
            'items.*.item_id.exists' => 'Item barang tidak ditemukan.',
            'items.*.jumlah_diminta.required' => 'Jumlah diminta wajib diisi.',
            'items.*.jumlah_diminta.integer' => 'Jumlah diminta harus berupa angka.',
            'items.*.jumlah_diminta.min' => 'Jumlah diminta minimal 1.',
        ];
    }
}
