<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => fn () => $request->user()
                    ? array_merge($request->user()->toArray(), [
                        'permissions' => $this->getUserPermissions($request->user()),
                        'roles' => $this->getUserRoles($request->user()),
                    ])
                    : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Get user permissions.
     *
     * @return array<string>
     */
    protected function getUserPermissions(mixed $user): array
    {
        if (method_exists($user, 'getAllPermissions')) {
            return $user->getAllPermissions()->pluck('name')->toArray();
        }

        return [];
    }

    /**
     * Get user roles.
     *
     * @return array<string>
     */
    protected function getUserRoles(mixed $user): array
    {
        if (method_exists($user, 'getRoleNames')) {
            return $user->getRoleNames()->toArray();
        }

        return [];
    }
}
