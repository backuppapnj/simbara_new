<?php

use App\Models\Department;
use App\Models\OfficeMutation;
use App\Models\OfficeRequest;
use App\Models\OfficeRequestDetail;
use App\Models\OfficeSupply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('OfficeRequest Management', function () {
    describe('POST /office-requests (Store)', function () {
        it('requires authentication', function () {
            $supply = OfficeSupply::factory()->create();

            $response = $this->postJson('/office-requests', [
                'tanggal' => now()->toDateString(),
                'department_id' => Department::factory()->create()->id,
                'keterangan' => 'Test request',
                'items' => [
                    [
                        'supply_id' => $supply->id,
                        'jumlah' => 5,
                    ],
                ],
            ]);

            $response->assertUnauthorized();
        });

        it('creates a new request with valid data', function () {
            $user = User::factory()->create();
            $department = Department::factory()->create();
            $supply1 = OfficeSupply::factory()->create(['stok' => 50]);
            $supply2 = OfficeSupply::factory()->create(['stok' => 30]);

            $response = $this->actingAs($user)
                ->postJson('/office-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'keterangan' => 'Permintaan bahan kantor',
                    'items' => [
                        [
                            'supply_id' => $supply1->id,
                            'jumlah' => 10,
                        ],
                        [
                            'supply_id' => $supply2->id,
                            'jumlah' => 5,
                        ],
                    ],
                ]);

            $response->assertCreated();

            $response->assertJsonStructure([
                'data' => [
                    'id',
                    'no_permintaan',
                    'user_id',
                    'department_id',
                    'tanggal',
                    'status',
                    'keterangan',
                ],
            ]);

            $this->assertDatabaseHas('office_requests', [
                'user_id' => $user->id,
                'department_id' => $department->id,
                'status' => 'pending',
                'keterangan' => 'Permintaan bahan kantor',
            ]);

            $request = OfficeRequest::where('user_id', $user->id)->first();
            expect($request->details)->toHaveCount(2);

            $this->assertDatabaseHas('office_request_details', [
                'request_id' => $request->id,
                'supply_id' => $supply1->id,
                'jumlah' => 10,
                'jumlah_diberikan' => null, // Initially null until approved
            ]);

            $this->assertDatabaseHas('office_request_details', [
                'request_id' => $request->id,
                'supply_id' => $supply2->id,
                'jumlah' => 5,
                'jumlah_diberikan' => null,
            ]);
        });

        it('validates required fields', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-requests', []);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['tanggal', 'department_id', 'items']);
        });

        it('validates items is an array', function () {
            $user = User::factory()->create();
            $department = Department::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => 'not an array',
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items']);
        });

        it('validates items array is not empty', function () {
            $user = User::factory()->create();
            $department = Department::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items']);
        });

        it('validates each item has supply_id and jumlah', function () {
            $user = User::factory()->create();
            $department = Department::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        ['supply_id' => OfficeSupply::factory()->create()->id],
                        ['jumlah' => 5],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.jumlah', 'items.1.supply_id']);
        });

        it('validates supply_id exists in office_supplies table', function () {
            $user = User::factory()->create();
            $department = Department::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        [
                            'supply_id' => (string) Str::ulid(),
                            'jumlah' => 5,
                        ],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.supply_id']);
        });

        it('validates jumlah is at least 1', function () {
            $user = User::factory()->create();
            $department = Department::factory()->create();
            $supply = OfficeSupply::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/office-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 0,
                        ],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.jumlah']);
        });

        it('generates unique request number', function () {
            $user = User::factory()->create();
            $department = Department::factory()->create();
            $supply = OfficeSupply::factory()->create();

            $response1 = $this->actingAs($user)
                ->postJson('/office-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 5,
                        ],
                    ],
                ]);

            $response2 = $this->actingAs($user)
                ->postJson('/office-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        [
                            'supply_id' => $supply->id,
                            'jumlah' => 3,
                        ],
                    ],
                ]);

            $noPermintaan1 = $response1->json('data.no_permintaan');
            $noPermintaan2 = $response2->json('data.no_permintaan');

            expect($noPermintaan1)->not->toBe($noPermintaan2);
            expect($noPermintaan1)->toStartWith('REQ-');
        });
    });

    describe('GET /office-requests (Index)', function () {
        it('requires authentication', function () {
            $response = $this->getJson('/office-requests');

            $response->assertUnauthorized();
        });

        it('returns list of requests', function () {
            $user = User::factory()->create();

            OfficeRequest::factory()->count(3)->create(['user_id' => $user->id]);

            $response = $this->actingAs($user)
                ->getJson('/office-requests');

            $response->assertOk()
                ->assertJsonCount(3, 'data');
        });

        it('returns only user own requests for regular users', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();

            OfficeRequest::factory()->count(2)->create(['user_id' => $user1->id]);
            OfficeRequest::factory()->count(3)->create(['user_id' => $user2->id]);

            $response = $this->actingAs($user1)
                ->getJson('/office-requests');

            $response->assertOk()
                ->assertJsonCount(2, 'data');
        });
    });

    describe('GET /office-requests/{id} (Show)', function () {
        it('requires authentication', function () {
            $request = OfficeRequest::factory()->create();

            $response = $this->getJson("/office-requests/{$request->id}");

            $response->assertUnauthorized();
        });

        it('returns request details with request details', function () {
            $user = User::factory()->create();
            $request = OfficeRequest::factory()->create(['user_id' => $user->id]);

            OfficeRequestDetail::factory()->count(2)->create(['request_id' => $request->id]);

            $response = $this->actingAs($user)
                ->getJson("/office-requests/{$request->id}");

            $response->assertOk()
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'no_permintaan',
                        'user_id',
                        'department_id',
                        'tanggal',
                        'status',
                        'keterangan',
                        'details',
                    ],
                ])
                ->assertJsonCount(2, 'data.details');
        });

        it('forbids viewing other users requests', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();
            $request = OfficeRequest::factory()->create(['user_id' => $user2->id]);

            $response = $this->actingAs($user1)
                ->getJson("/office-requests/{$request->id}");

            $response->assertForbidden();
        });
    });

    describe('POST /office-requests/{id}/approve', function () {
        it('requires authentication', function () {
            $request = OfficeRequest::factory()->pending()->create();

            $response = $this->postJson("/office-requests/{$request->id}/approve");

            $response->assertUnauthorized();
        });

        it('approves request and creates mutations with stock reduction', function () {
            $user = User::factory()->create();
            $supply1 = OfficeSupply::factory()->create(['stok' => 50]);
            $supply2 = OfficeSupply::factory()->create(['stok' => 30]);
            $request = OfficeRequest::factory()->pending()->create();

            OfficeRequestDetail::factory()->create([
                'request_id' => $request->id,
                'supply_id' => $supply1->id,
                'jumlah' => 10,
            ]);
            OfficeRequestDetail::factory()->create([
                'request_id' => $request->id,
                'supply_id' => $supply2->id,
                'jumlah' => 5,
            ]);

            $response = $this->actingAs($user)
                ->postJson("/office-requests/{$request->id}/approve");

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'status' => 'completed',
                        'approved_by' => $user->id,
                    ],
                ]);

            $this->assertDatabaseHas('office_requests', [
                'id' => $request->id,
                'status' => 'completed',
                'approved_by' => $user->id,
                'approved_at' => now()->toDateTimeString(),
            ]);

            // Verify stock was reduced
            $supply1->refresh();
            $supply2->refresh();
            expect($supply1->stok)->toBe(40); // 50 - 10
            expect($supply2->stok)->toBe(25); // 30 - 5

            // Verify mutations were created (keluar)
            $this->assertDatabaseHas('office_mutations', [
                'supply_id' => $supply1->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => 10,
                'stok_sebelum' => 50,
                'stok_sesudah' => 40,
                'tipe' => 'permintaan',
                'referensi_id' => $request->id,
                'user_id' => $user->id,
            ]);

            $this->assertDatabaseHas('office_mutations', [
                'supply_id' => $supply2->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => 5,
                'stok_sebelum' => 30,
                'stok_sesudah' => 25,
                'tipe' => 'permintaan',
                'referensi_id' => $request->id,
                'user_id' => $user->id,
            ]);

            // Verify jumlah_diberikan was set
            $this->assertDatabaseHas('office_request_details', [
                'request_id' => $request->id,
                'supply_id' => $supply1->id,
                'jumlah' => 10,
                'jumlah_diberikan' => 10,
            ]);
        });

        it('can only approve pending requests', function () {
            $user = User::factory()->create();
            $request = OfficeRequest::factory()->completed()->create();

            $response = $this->actingAs($user)
                ->postJson("/office-requests/{$request->id}/approve");

            $response->assertUnprocessable();
        });

        it('handles insufficient stock gracefully', function () {
            $user = User::factory()->create();
            $supply = OfficeSupply::factory()->create(['stok' => 5]);
            $request = OfficeRequest::factory()->pending()->create();

            OfficeRequestDetail::factory()->create([
                'request_id' => $request->id,
                'supply_id' => $supply->id,
                'jumlah' => 10, // Request more than available
            ]);

            $response = $this->actingAs($user)
                ->postJson("/office-requests/{$request->id}/approve");

            // Should still approve but with available amount
            $response->assertOk();

            // Verify stock went to 0
            $supply->refresh();
            expect($supply->stok)->toBe(0);

            // Verify jumlah_diberikan equals available amount (5)
            $detail = OfficeRequestDetail::where('request_id', $request->id)
                ->where('supply_id', $supply->id)
                ->first();
            expect($detail->jumlah_diberikan)->toBe(5);
        });
    });

    describe('POST /office-requests/{id}/reject', function () {
        it('requires authentication', function () {
            $request = OfficeRequest::factory()->pending()->create();

            $response = $this->postJson("/office-requests/{$request->id}/reject");

            $response->assertUnauthorized();
        });

        it('rejects request with reason', function () {
            $user = User::factory()->create();
            $request = OfficeRequest::factory()->pending()->create();

            $response = $this->actingAs($user)
                ->postJson("/office-requests/{$request->id}/reject", [
                    'alasan_penolakan' => 'Stok tidak tersedia',
                ]);

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'status' => 'rejected',
                        'alasan_penolakan' => 'Stok tidak tersedia',
                    ],
                ]);

            $this->assertDatabaseHas('office_requests', [
                'id' => $request->id,
                'status' => 'rejected',
                'alasan_penolakan' => 'Stok tidak tersedia',
            ]);
        });

        it('requires rejection reason', function () {
            $user = User::factory()->create();
            $request = OfficeRequest::factory()->pending()->create();

            $response = $this->actingAs($user)
                ->postJson("/office-requests/{$request->id}/reject");

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['alasan_penolakan']);
        });

        it('can only reject pending requests', function () {
            $user = User::factory()->create();
            $request = OfficeRequest::factory()->rejected()->create();

            $response = $this->actingAs($user)
                ->postJson("/office-requests/{$request->id}/reject", [
                    'alasan_penolakan' => 'Test',
                ]);

            $response->assertUnprocessable();
        });

        it('does not create mutations on rejection', function () {
            $user = User::factory()->create();
            $supply = OfficeSupply::factory()->create(['stok' => 50]);
            $request = OfficeRequest::factory()->pending()->create();

            OfficeRequestDetail::factory()->create([
                'request_id' => $request->id,
                'supply_id' => $supply->id,
                'jumlah' => 10,
            ]);

            $this->actingAs($user)
                ->postJson("/office-requests/{$request->id}/reject", [
                    'alasan_penolakan' => 'Test',
                ]);

            // Verify stock was NOT changed
            $supply->refresh();
            expect($supply->stok)->toBe(50);

            // Verify NO mutations were created
            $this->assertDatabaseMissing('office_mutations', [
                'supply_id' => $supply->id,
                'tipe' => 'permintaan',
                'referensi_id' => $request->id,
            ]);
        });
    });
});
