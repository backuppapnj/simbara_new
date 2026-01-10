<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function create()
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request, CreateNewUser $creator)
    {
        $user = $creator->create($request->all());

        auth()->login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
