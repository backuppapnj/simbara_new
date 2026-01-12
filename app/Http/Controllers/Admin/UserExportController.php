<?php

namespace App\Http\Controllers\Admin;

use App\Exports\UserExport;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserExportController extends Controller
{
    use AuthorizesRequests;

    /**
     * Export users to CSV format.
     *
     * @param  \Illuminate\Http\Request  $request  The incoming HTTP request with optional filters
     * @return \Symfony\Component\HttpFoundation\StreamedResponse Returns streamed CSV response
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException When user lacks permission
     */
    public function __invoke(Request $request): StreamedResponse
    {
        // Check authorization using Gate
        $this->authorize('export', User::class);

        // Create export with filters
        $export = new UserExport(
            search: $request->input('search'),
            role: $request->input('role'),
            isActive: $request->boolean('is_active', null),
        );

        // Generate filename with date
        $filename = 'users-'.date('Y-m-d').'.csv';

        // Stream CSV response
        return Response::streamDownload(function () use ($export) {
            // Open output stream
            $handle = fopen('php://output', 'w');

            // Add UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Add headers
            fputcsv($handle, $export->headers());

            // Add data rows
            foreach ($export->query()->cursor() as $user) {
                fputcsv($handle, $export->map($user));
            }

            // Close stream
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
