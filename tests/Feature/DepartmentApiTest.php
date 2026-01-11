<?php

use App\Models\Department;

test('can get departments list as json', function () {
    // Create test departments
    Department::factory()->create([
        'nama_unit' => 'IT Department',
        'singkat' => 'IT',
        'kepala_unit' => 'John Doe',
    ]);

    Department::factory()->create([
        'nama_unit' => 'HR Department',
        'singkat' => 'HR',
        'kepala_unit' => 'Jane Smith',
    ]);

    // Make request
    $response = $this->getJson('/departments');

    // Assert response
    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'nama_unit',
                    'singkat',
                    'kepala_unit',
                ],
            ],
        ])
        ->assertJsonPath('data.0.nama_unit', 'HR Department')
        ->assertJsonPath('data.1.nama_unit', 'IT Department');
});

test('departments endpoint returns empty array when no departments', function () {
    $response = $this->getJson('/departments');

    $response->assertStatus(200)
        ->assertJsonPath('data', []);
});
