<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Get the validation rules for the input.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function rules(array $input): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique(User::class),
            ],
            'nip' => [
                'required',
                'string',
                'max:20',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ];
    }

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        // Normalize phone number before validation
        $input['phone'] = $this->normalizePhone($input['phone']);

        Validator::make($input, $this->rules($input))->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'nip' => $input['nip'],
            'password' => $input['password'],
        ]);
    }

    /**
     * Normalize phone number to +62 format.
     */
    protected function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\s+/', '', $phone);

        if (empty($phone)) {
            return null;
        }

        // Convert 08... or 628... to +628...
        $phone = preg_replace('/^(0|62)/', '+62', $phone);

        return $phone;
    }
}
