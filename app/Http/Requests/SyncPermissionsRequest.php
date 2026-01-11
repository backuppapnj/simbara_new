<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncPermissionsRequest extends FormRequest
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
            'permission_ids' => ['required', 'array'],
            'permission_ids.*' => ['required', 'string', 'exists:permissions,name'],
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
            'permission_ids.required' => 'Permission IDs wajib diisi.',
            'permission_ids.array' => 'Permission IDs harus berupa array.',
            'permission_ids.*.required' => 'Setiap permission ID wajib diisi.',
            'permission_ids.*.exists' => 'Permission tidak ditemukan dalam database.',
        ];
    }
}
