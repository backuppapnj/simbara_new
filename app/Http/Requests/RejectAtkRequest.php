<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectAtkRequest extends FormRequest
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
            'alasan_penolakan' => ['required', 'string', 'max:1000'],
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
            'alasan_penolakan.required' => 'Alasan penolakan wajib diisi.',
            'alasan_penolakan.max' => 'Alasan penolakan maksimal 1000 karakter.',
        ];
    }
}
