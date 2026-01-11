<?php

use App\Models\AtkRequest;
use App\Models\Department;
use App\Models\Item;
use App\Models\RequestDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

// Helper function to create a user with specific permissions
function createAtkUserWithPermissions(array $permissions): User
{
    $user = User::factory()->create();
    foreach ($permissions as $permission) {
        \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permission]);
        $user->givePermissionTo($permission);
    }

    return $user;
}

describe('AtkRequest Management', function () {
    describe('POST /atk-requests (Store)', function () {
        it('requires authentication', function () {
            $response = $this->postJson('/atk-requests', [
                'tanggal' => now()->toDateString(),
                'department_id' => Department::factory()->create()->id,
                'keterangan' => 'Test request',
                'items' => [
                    [
                        'item_id' => Item::factory()->create()->id,
                        'jumlah_diminta' => 5,
                    ],
                ],
            ]);

            $response->assertUnauthorized();
        });

        it('creates a new request with valid data', function () {
            $user = createAtkUserWithPermissions(['atk.create']);
            $department = Department::factory()->create();
            $item1 = Item::factory()->create(['stok' => 50]);
            $item2 = Item::factory()->create(['stok' => 30]);

            $response = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'keterangan' => 'Permintaan ATK bulanan',
                    'items' => [
                        [
                            'item_id' => $item1->id,
                            'jumlah_diminta' => 10,
                        ],
                        [
                            'item_id' => $item2->id,
                            'jumlah_diminta' => 5,
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

            $this->assertDatabaseHas('atk_requests', [
                'user_id' => $user->id,
                'department_id' => $department->id,
                'status' => 'pending',
                'keterangan' => 'Permintaan ATK bulanan',
            ]);

            $request = AtkRequest::where('user_id', $user->id)->first();
            expect($request->requestDetails)->toHaveCount(2);

            $this->assertDatabaseHas('request_details', [
                'request_id' => $request->id,
                'item_id' => $item1->id,
                'jumlah_diminta' => 10,
                'jumlah_disetujui' => 10,
            ]);

            $this->assertDatabaseHas('request_details', [
                'request_id' => $request->id,
                'item_id' => $item2->id,
                'jumlah_diminta' => 5,
                'jumlah_disetujui' => 5,
            ]);
        });

        it('validates required fields', function () {
            $user = createAtkUserWithPermissions(['atk.create']);

            $response = $this->actingAs($user)
                ->postJson('/atk-requests', []);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['tanggal', 'department_id', 'items']);
        });

        it('validates items is an array', function () {
            $user = createAtkUserWithPermissions(['atk.create']);
            $department = Department::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => 'not an array',
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items']);
        });

        it('validates items array is not empty', function () {
            $user = createAtkUserWithPermissions(['atk.create']);
            $department = Department::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items']);
        });

        it('validates each item has item_id and jumlah_diminta', function () {
            $user = createAtkUserWithPermissions(['atk.create']);
            $department = Department::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        ['item_id' => Item::factory()->create()->id],
                        ['jumlah_diminta' => 5],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.jumlah_diminta', 'items.1.item_id']);
        });

        it('validates item_id exists in items table', function () {
            $user = createAtkUserWithPermissions(['atk.create']);
            $department = Department::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        [
                            'item_id' => (string) Str::ulid(),
                            'jumlah_diminta' => 5,
                        ],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.item_id']);
        });

        it('validates jumlah_diminta is at least 1', function () {
            $user = createAtkUserWithPermissions(['atk.create']);
            $department = Department::factory()->create();
            $item = Item::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        [
                            'item_id' => $item->id,
                            'jumlah_diminta' => 0,
                        ],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.jumlah_diminta']);
        });

        it('generates unique request number', function () {
            $user = createAtkUserWithPermissions(['atk.create']);
            $department = Department::factory()->create();
            $item = Item::factory()->create();

            $response1 = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        [
                            'item_id' => $item->id,
                            'jumlah_diminta' => 5,
                        ],
                    ],
                ]);

            $response2 = $this->actingAs($user)
                ->postJson('/atk-requests', [
                    'tanggal' => now()->toDateString(),
                    'department_id' => $department->id,
                    'items' => [
                        [
                            'item_id' => $item->id,
                            'jumlah_diminta' => 3,
                        ],
                    ],
                ]);

            $noPermintaan1 = $response1->json('data.no_permintaan');
            $noPermintaan2 = $response2->json('data.no_permintaan');

            expect($noPermintaan1)->not->toBe($noPermintaan2);
        });
    });

    describe('GET /atk-requests (Index)', function () {
        it('requires authentication', function () {
            $response = $this->getJson('/atk-requests');

            $response->assertUnauthorized();
        });

        it('returns list of requests', function () {
            $user = createAtkUserWithPermissions(['atk.view']);

            AtkRequest::factory()->count(3)->create(['user_id' => $user->id]);

            $response = $this->actingAs($user)
                ->getJson('/atk-requests');

            $response->assertOk()
                ->assertJsonCount(3, 'data');
        });

        it('returns only user own requests for regular users', function () {
            $user1 = createAtkUserWithPermissions(['atk.view']);
            $user2 = createAtkUserWithPermissions(['atk.view']);

            AtkRequest::factory()->count(2)->create(['user_id' => $user1->id]);
            AtkRequest::factory()->count(3)->create(['user_id' => $user2->id]);

            $response = $this->actingAs($user1)
                ->getJson('/atk-requests');

            $response->assertOk()
                ->assertJsonCount(2, 'data');
        });
    });

    describe('GET /atk-requests/{id} (Show)', function () {
        it('requires authentication', function () {
            $request = AtkRequest::factory()->create();

            $response = $this->getJson("/atk-requests/{$request->id}");

            $response->assertUnauthorized();
        });

        it('returns request details with request details', function () {
            $user = createAtkUserWithPermissions(['atk.view']);
            $request = AtkRequest::factory()->create(['user_id' => $user->id]);

            // Verify the user ID matches
            expect($request->user_id)->toBe($user->id);

            RequestDetail::factory()->count(2)->create(['request_id' => $request->id]);

            $response = $this->actingAs($user)
                ->getJson("/atk-requests/{$request->id}");

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
                        'request_details',
                    ],
                ])
                ->assertJsonCount(2, 'data.request_details');
        });

        it('forbids viewing other users requests', function () {
            $user1 = createAtkUserWithPermissions(['atk.view']);
            $user2 = createAtkUserWithPermissions(['atk.view']);
            $request = AtkRequest::factory()->create(['user_id' => $user2->id]);

            $response = $this->actingAs($user1)
                ->getJson("/atk-requests/{$request->id}");

            $response->assertForbidden();
        });
    });

    describe('POST /atk-requests/{id}/approve-level1', function () {
        it('requires authentication', function () {
            $request = AtkRequest::factory()->pending()->create();

            $response = $this->postJson("/atk-requests/{$request->id}/approve-level1");

            $response->assertUnauthorized();
        });

        it('approves request at level 1', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->pending()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/approve-level1");

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'status' => 'level1_approved',
                        'level1_approval_by' => $user->id,
                    ],
                ]);

            $this->assertDatabaseHas('atk_requests', [
                'id' => $request->id,
                'status' => 'level1_approved',
                'level1_approval_by' => $user->id,
            ]);
        });

        it('can only approve pending requests', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->level2Approved()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/approve-level1");

            $response->assertUnprocessable();
        });
    });

    describe('POST /atk-requests/{id}/approve-level2', function () {
        it('requires authentication', function () {
            $request = AtkRequest::factory()->level1Approved()->create();

            $response = $this->postJson("/atk-requests/{$request->id}/approve-level2");

            $response->assertUnauthorized();
        });

        it('approves request at level 2', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->level1Approved()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/approve-level2");

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'status' => 'level2_approved',
                        'level2_approval_by' => $user->id,
                    ],
                ]);

            $this->assertDatabaseHas('atk_requests', [
                'id' => $request->id,
                'status' => 'level2_approved',
                'level2_approval_by' => $user->id,
            ]);
        });

        it('can only approve level1 approved requests', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->pending()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/approve-level2");

            $response->assertUnprocessable();
        });
    });

    describe('POST /atk-requests/{id}/approve-level3', function () {
        it('requires authentication', function () {
            $request = AtkRequest::factory()->level2Approved()->create();

            $response = $this->postJson("/atk-requests/{$request->id}/approve-level3");

            $response->assertUnauthorized();
        });

        it('approves request at level 3', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->level2Approved()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/approve-level3");

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'status' => 'level3_approved',
                        'level3_approval_by' => $user->id,
                    ],
                ]);

            $this->assertDatabaseHas('atk_requests', [
                'id' => $request->id,
                'status' => 'level3_approved',
                'level3_approval_by' => $user->id,
            ]);
        });

        it('can only approve level2 approved requests', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->pending()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/approve-level3");

            $response->assertUnprocessable();
        });
    });

    describe('POST /atk-requests/{id}/reject', function () {
        it('requires authentication', function () {
            $request = AtkRequest::factory()->pending()->create();

            $response = $this->postJson("/atk-requests/{$request->id}/reject");

            $response->assertUnauthorized();
        });

        it('rejects request with reason', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->pending()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/reject", [
                    'alasan_penolakan' => 'Stok tidak tersedia',
                ]);

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'status' => 'rejected',
                        'alasan_penolakan' => 'Stok tidak tersedia',
                    ],
                ]);

            $this->assertDatabaseHas('atk_requests', [
                'id' => $request->id,
                'status' => 'rejected',
                'alasan_penolakan' => 'Stok tidak tersedia',
            ]);
        });

        it('requires rejection reason', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->pending()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/reject");

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['alasan_penolakan']);
        });

        it('can only reject pending or approved requests', function () {
            $user = createAtkUserWithPermissions(['atk.requests.approve']);
            $request = AtkRequest::factory()->rejected()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/reject", [
                    'alasan_penolakan' => 'Test',
                ]);

            $response->assertUnprocessable();
        });
    });

    describe('POST /atk-requests/{id}/distribute', function () {
        it('requires authentication', function () {
            $request = AtkRequest::factory()->level3Approved()->create();

            $response = $this->postJson("/atk-requests/{$request->id}/distribute", [
                'items' => [
                    [
                        'detail_id' => RequestDetail::factory()->create(['request_id' => $request->id])->id,
                        'jumlah_diberikan' => 5,
                    ],
                ],
            ]);

            $response->assertUnauthorized();
        });

        it('distributes approved request with jumlah diberikan', function () {
            $user = createAtkUserWithPermissions(['atk.requests.distribute']);
            $request = AtkRequest::factory()->level3Approved()->create();
            $detail = RequestDetail::factory()->create([
                'request_id' => $request->id,
                'jumlah_diminta' => 10,
                'jumlah_disetujui' => 10,
            ]);

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/distribute", [
                    'items' => [
                        [
                            'detail_id' => $detail->id,
                            'jumlah_diberikan' => 8,
                        ],
                    ],
                ]);

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'status' => 'diserahkan',
                        'distributed_by' => $user->id,
                    ],
                ]);

            $this->assertDatabaseHas('atk_requests', [
                'id' => $request->id,
                'status' => 'diserahkan',
                'distributed_by' => $user->id,
            ]);

            $this->assertDatabaseHas('request_details', [
                'id' => $detail->id,
                'jumlah_diberikan' => 8,
            ]);
        });

        it('can only distribute level3 approved requests', function () {
            $user = createAtkUserWithPermissions(['atk.requests.distribute']);
            $request = AtkRequest::factory()->pending()->create();
            $detail = RequestDetail::factory()->create(['request_id' => $request->id]);

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/distribute", [
                    'items' => [
                        [
                            'detail_id' => $detail->id,
                            'jumlah_diberikan' => 5,
                        ],
                    ],
                ]);

            $response->assertUnprocessable();
        });

        it('validates jumlah_diberikan does not exceed jumlah_disetujui', function () {
            $user = createAtkUserWithPermissions(['atk.requests.distribute']);
            $request = AtkRequest::factory()->level3Approved()->create();
            $detail = RequestDetail::factory()->create([
                'request_id' => $request->id,
                'jumlah_diminta' => 10,
                'jumlah_disetujui' => 8,
            ]);

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/distribute", [
                    'items' => [
                        [
                            'detail_id' => $detail->id,
                            'jumlah_diberikan' => 10,
                        ],
                    ],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items.0.jumlah_diberikan']);
        });

        it('validates items array is not empty', function () {
            $user = createAtkUserWithPermissions(['atk.requests.distribute']);
            $request = AtkRequest::factory()->level3Approved()->create();

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/distribute", [
                    'items' => [],
                ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['items']);
        });
    });

    describe('POST /atk-requests/{id}/confirm-receive', function () {
        it('requires authentication', function () {
            $request = AtkRequest::factory()->diserahkan()->create();

            $response = $this->postJson("/atk-requests/{$request->id}/confirm-receive");

            $response->assertUnauthorized();
        });

        it('confirms receipt and creates stock mutations', function () {
            $user = User::factory()->create();
            $item = Item::factory()->create(['stok' => 100]);
            $request = AtkRequest::factory()->diserahkan()->create(['user_id' => $user->id]);
            $detail = RequestDetail::factory()->create([
                'request_id' => $request->id,
                'item_id' => $item->id,
                'jumlah_diminta' => 10,
                'jumlah_disetujui' => 10,
                'jumlah_diberikan' => 8,
            ]);

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/confirm-receive");

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'status' => 'diterima',
                    ],
                ]);

            $this->assertDatabaseHas('atk_requests', [
                'id' => $request->id,
                'status' => 'diterima',
            ]);

            // Verify stock was reduced
            $item->refresh();
            expect($item->stok)->toBe(92);

            // Verify stock mutation was created
            $this->assertDatabaseHas('stock_mutations', [
                'item_id' => $item->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => 8,
                'stok_sebelum' => 100,
                'stok_sesudah' => 92,
                'referensi_id' => $request->id,
                'referensi_tipe' => 'atk_request',
            ]);
        });

        it('can only confirm diserahkan requests', function () {
            $user = User::factory()->create();
            $request = AtkRequest::factory()->pending()->create(['user_id' => $user->id]);

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/confirm-receive");

            $response->assertUnprocessable();
        });

        it('only request owner can confirm receipt', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();
            $request = AtkRequest::factory()->diserahkan()->create(['user_id' => $user1->id]);

            $response = $this->actingAs($user2)
                ->postJson("/atk-requests/{$request->id}/confirm-receive");

            $response->assertForbidden();
        });

        it('handles multiple items in confirmation', function () {
            $user = User::factory()->create();
            $item1 = Item::factory()->create(['stok' => 50]);
            $item2 = Item::factory()->create(['stok' => 30]);
            $request = AtkRequest::factory()->diserahkan()->create(['user_id' => $user->id]);
            $detail1 = RequestDetail::factory()->create([
                'request_id' => $request->id,
                'item_id' => $item1->id,
                'jumlah_diberikan' => 5,
            ]);
            $detail2 = RequestDetail::factory()->create([
                'request_id' => $request->id,
                'item_id' => $item2->id,
                'jumlah_diberikan' => 3,
            ]);

            $response = $this->actingAs($user)
                ->postJson("/atk-requests/{$request->id}/confirm-receive");

            $response->assertOk();

            $item1->refresh();
            $item2->refresh();
            expect($item1->stok)->toBe(45);
            expect($item2->stok)->toBe(27);

            $this->assertDatabaseHas('stock_mutations', [
                'item_id' => $item1->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => 5,
                'stok_sebelum' => 50,
                'stok_sesudah' => 45,
            ]);

            $this->assertDatabaseHas('stock_mutations', [
                'item_id' => $item2->id,
                'jenis_mutasi' => 'keluar',
                'jumlah' => 3,
                'stok_sebelum' => 30,
                'stok_sesudah' => 27,
            ]);
        });
    });
});
