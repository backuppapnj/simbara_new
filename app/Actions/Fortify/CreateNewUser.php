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
        Validator::make($input, $this->rules($input))->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'nip' => $input['nip'],
            'password' => $input['password'],
        ]);
    }
}
