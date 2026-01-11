<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuickDeductRequest extends FormRequest
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
            'supply_id' => ['required', 'string', 'exists:office_supplies,id'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'keterangan' => ['nullable', 'string'],
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
            'supply_id.required' => 'Bahan kantor wajib dipilih.',
            'supply_id.exists' => 'Bahan kantor tidak ditemukan.',
            'jumlah.required' => 'Jumlah wajib diisi.',
            'jumlah.integer' => 'Jumlah harus berupa angka.',
            'jumlah.min' => 'Jumlah minimal 1.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $supplyId = $this->input('supply_id');
            $jumlah = $this->input('jumlah');

            if ($supplyId && $jumlah) {
                $supply = \App\Models\OfficeSupply::find($supplyId);

                if ($supply && $jumlah > $supply->stok) {
                    $validator->errors()->add('jumlah', 'Jumlah melebihi stok yang tersedia ('.$supply->stok.' '.$supply->satuan.').');
                }
            }
        });
    }
}
