<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReceivePurchaseRequest extends FormRequest
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
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_detail_id' => ['required', 'string', 'exists:purchase_details,id'],
            'items.*.jumlah_diterima' => [
                'required',
                'integer',
                'min:0',
                function (string $attribute, mixed $value, callable $fail) {
                    // Extract the index from the attribute (e.g., "items.0.jumlah_diterima")
                    preg_match('/items\.(\d+)\.jumlah_diterima/', $attribute, $matches);
                    $index = $matches[1] ?? null;

                    if ($index === null) {
                        return;
                    }

                    $purchaseDetailId = $this->input("items.{$index}.purchase_detail_id");
                    $detail = \App\Models\PurchaseDetail::find($purchaseDetailId);

                    if ($detail && $value > $detail->jumlah) {
                        $fail("The received quantity cannot exceed the ordered quantity ({$detail->jumlah}).");
                    }
                },
            ],
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
            'items.required' => 'At least one item must be verified.',
            'items.min' => 'At least one item must be verified.',
            'items.*.purchase_detail_id.exists' => 'The selected purchase detail is invalid.',
            'items.*.jumlah_diterima.min' => 'The received quantity cannot be negative.',
        ];
    }
}
