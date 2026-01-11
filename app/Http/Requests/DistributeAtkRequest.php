<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DistributeAtkRequest extends FormRequest
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
            'items.*.detail_id' => ['required', 'exists:request_details,id'],
            'items.*.jumlah_diberikan' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function ($validator) {
            $items = $validator->validated()['items'] ?? [];

            foreach ($items as $index => $item) {
                if (isset($item['detail_id'], $item['jumlah_diberikan'])) {
                    $detail = \App\Models\RequestDetail::find($item['detail_id']);

                    if ($detail && $item['jumlah_diberikan'] > $detail->jumlah_disetujui) {
                        $validator->errors()->add("items.{$index}.jumlah_diberikan", 'The jumlah diberikan cannot exceed jumlah disetujui.');
                    }
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'The items field is required.',
            'items.array' => 'The items must be an array.',
            'items.min' => 'At least one item must be provided.',
            'items.*.detail_id.required' => 'The detail ID is required.',
            'items.*.detail_id.exists' => 'The selected detail ID is invalid.',
            'items.*.jumlah_diberikan.required' => 'The jumlah diberikan is required.',
            'items.*.jumlah_diberikan.integer' => 'The jumlah diberikan must be an integer.',
            'items.*.jumlah_diberikan.min' => 'The jumlah diberikan must be at least 1.',
        ];
    }
}
