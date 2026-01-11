<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(Request $request): JsonResponse
    {
        $departments = Department::query()
            ->orderBy('nama_unit')
            ->get();

        return response()->json([
            'data' => $departments,
        ]);
    }
}
