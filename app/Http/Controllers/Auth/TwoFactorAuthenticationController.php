<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TwoFactorAuthenticationController extends Controller
{
    public function create()
    {
        if (! session()->has('login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/two-factor-challenge');
    }

    public function store(Request $request)
    {
        if (! session()->has('login.id')) {
            return redirect()->route('login');
        }

        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $id = session('login.id');

        if (! $request->has('recovery')) {
            $user = \App\Models\User::findOrFail($id);

            if (! $user->two_factor_secret) {
                return back()->withErrors(['code' => __('Two factor authentication is not enabled.')]);
            }

            $valid = $user->validateTwoFactorCode($request->code);

            if (! $valid) {
                return back()->withErrors(['code' => __('The provided code is invalid.')]);
            }
        } else {
            $user = \App\Models\User::findOrFail($id);

            if (! $user->two_factor_recovery_codes) {
                return back()->withErrors(['code' => __('The provided recovery code is invalid.')]);
            }

            $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);

            if (! in_array($request->code, $recoveryCodes)) {
                return back()->withErrors(['code' => __('The provided recovery code is invalid.')]);
            }

            // Invalidate the used recovery code
            $key = array_search($request->code, $recoveryCodes);
            unset($recoveryCodes[$key]);
            $user->forceFill([
                'two_factor_recovery_codes' => encrypt(json_encode(array_values($recoveryCodes))),
            ])->save();
        }

        session()->forget('login.id');

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function storeRecoveryCode(Request $request)
    {
        $request['recovery'] = true;

        return $this->store($request);
    }
}
