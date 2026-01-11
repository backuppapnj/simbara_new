<?php

use App\Models\AtkRequest;
use App\Models\Item;
use App\Models\Purchase;
use App\Models\RequestDetail;
use App\Models\StockMutation;
use App\Models\StockOpname;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

// Helper function to create a user with specific permissions
function createAtkReportUserWithPermissions(array $permissions): User
{
    $user = User::factory()->create();
    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
        $user->givePermissionTo($permission);
    }

    return $user;
}

test('can view stock card report for an item', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);
    $item = Item::factory()->create([
        'kode_barang' => 'ATK-001',
        'nama_barang' => 'Kertas A4',
        'stok' => 100,
        'stok_minimal' => 20,
    ]);

    // Create some stock mutations
    StockMutation::factory()->create([
        'item_id' => $item->id,
        'jenis_mutasi' => 'masuk',
        'jumlah' => 50,
        'stok_sebelum' => 50,
        'stok_sesudah' => 100,
        'referensi_id' => 'PUR-001',
        'referensi_tipe' => 'purchase',
    ]);

    StockMutation::factory()->create([
        'item_id' => $item->id,
        'jenis_mutasi' => 'keluar',
        'jumlah' => 10,
        'stok_sebelum' => 100,
        'stok_sesudah' => 90,
        'referensi_id' => 'REQ-001',
        'referensi_tipe' => 'request',
    ]);

    $response = $this->actingAs($user)->getJson("/atk-reports/stock-card/{$item->id}");

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data' => [
            'item' => [
                'id',
                'kode_barang',
                'nama_barang',
                'stok',
            ],
            'mutations' => [
                '*' => [
                    'id',
                    'jenis_mutasi',
                    'jumlah',
                    'stok_sebelum',
                    'stok_sesudah',
                    'keterangan',
                    'created_at',
                ],
            ],
            'summary' => [
                'total_mutations',
                'total_masuk',
                'total_keluar',
                'total_adjustment',
            ],
        ],
    ]);
});

test('can view monthly summary report', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);

    // Create purchases
    $purchase = Purchase::factory()->create([
        'tanggal' => now()->startOfMonth(),
        'status' => 'completed',
        'total_nilai' => 500000,
    ]);

    // Create requests
    $request = AtkRequest::factory()->create([
        'tanggal' => now()->startOfMonth(),
        'status' => 'diterima',
    ]);

    // Create stock opname
    $stockOpname = StockOpname::factory()->create([
        'tanggal' => now()->startOfMonth(),
        'periode_bulan' => now()->format('F'),
        'periode_tahun' => now()->year,
        'status' => 'approved',
    ]);

    $response = $this->actingAs($user)->getJson('/atk-reports/monthly?'.http_build_query([
        'bulan' => now()->month,
        'tahun' => now()->year,
    ]));

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data' => [
            'period',
            'summary' => [
                'total_purchases',
                'total_purchase_value',
                'total_requests',
                'total_requests_approved',
                'total_stock_opnames',
            ],
            'purchases',
            'requests',
            'stock_opnames',
        ],
    ]);
});

test('can export stock card to pdf', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);
    $item = Item::factory()->create([
        'kode_barang' => 'ATK-001',
        'nama_barang' => 'Kertas A4',
    ]);

    StockMutation::factory()->count(3)->create([
        'item_id' => $item->id,
        'jenis_mutasi' => 'masuk',
    ]);

    $response = $this->actingAs($user)->getJson("/atk-reports/stock-card/{$item->id}/pdf");

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/pdf');
});

test('can export monthly report to pdf', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);

    $response = $this->actingAs($user)->getJson('/atk-reports/monthly/pdf?'.http_build_query([
        'bulan' => now()->month,
        'tahun' => now()->year,
    ]));

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/pdf');
});

test('can export monthly report to excel', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);

    $response = $this->actingAs($user)->getJson('/atk-reports/monthly/excel?'.http_build_query([
        'bulan' => now()->month,
        'tahun' => now()->year,
    ]));

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('can export request history report', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);
    $request = AtkRequest::factory()->create([
        'tanggal' => now()->subDays(5),
        'status' => 'diterima',
    ]);

    RequestDetail::factory()->count(2)->create([
        'request_id' => $request->id,
    ]);

    $response = $this->actingAs($user)->getJson('/atk-reports/requests?'.http_build_query([
        'start_date' => now()->subDays(7)->format('Y-m-d'),
        'end_date' => now()->format('Y-m-d'),
    ]));

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'no_permintaan',
                'tanggal',
                'status',
                'user',
                'department',
                'items_count',
            ],
        ],
    ]);
});

test('can export purchase history report', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);
    Purchase::factory()->count(3)->create([
        'tanggal' => now()->subDays(5),
        'status' => 'completed',
    ]);

    $response = $this->actingAs($user)->getJson('/atk-reports/purchases?'.http_build_query([
        'start_date' => now()->subDays(7)->format('Y-m-d'),
        'end_date' => now()->format('Y-m-d'),
    ]));

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'no_pembelian',
                'tanggal',
                'supplier',
                'total_nilai',
                'status',
            ],
        ],
    ]);
});

test('can export distribution report', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);
    $request = AtkRequest::factory()->create([
        'status' => 'diserahkan',
        'distributed_at' => now(),
    ]);

    RequestDetail::factory()->count(2)->create([
        'request_id' => $request->id,
        'jumlah_diberikan' => 10,
    ]);

    $response = $this->actingAs($user)->getJson('/atk-reports/distributions?'.http_build_query([
        'start_date' => now()->subDays(7)->format('Y-m-d'),
        'end_date' => now()->format('Y-m-d'),
    ]));

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'no_permintaan',
                'tanggal',
                'distributed_at',
                'user',
                'department',
                'items_count',
            ],
        ],
    ]);
});

test('can get low stock items report', function () {
    $user = createAtkReportUserWithPermissions(['atk.reports']);
    Item::factory()->create([
        'nama_barang' => 'Item A',
        'stok' => 10,
        'stok_minimal' => 20,
    ]);

    Item::factory()->create([
        'nama_barang' => 'Item B',
        'stok' => 50,
        'stok_minimal' => 20,
    ]);

    $response = $this->actingAs($user)->getJson('/atk-reports/low-stock');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'kode_barang',
                'nama_barang',
                'stok',
                'stok_minimal',
                'selisih',
            ],
        ],
    ]);

    // Should only return items below reorder point
    $data = $response->json('data');
    expect($data)->toHaveCount(1);
    expect($data[0]['nama_barang'])->toBe('Item A');
});
