<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StockMutation>
 */
class StockMutationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stokSebelum = fake()->numberBetween(0, 100);
        $jumlah = fake()->numberBetween(-20, 50);
        $stokSesudah = $stokSebelum + $jumlah;

        return [
            'item_id' => \App\Models\Item::factory(),
            'jenis_mutasi' => fake()->randomElement(['masuk', 'keluar', 'adjustment']),
            'jumlah' => abs($jumlah),
            'stok_sebelum' => $stokSebelum,
            'stok_sesudah' => max(0, $stokSesudah),
            'referensi_id' => null,
            'referensi_tipe' => null,
            'keterangan' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the mutation is a stock entry (masuk).
     */
    public function masuk(): static
    {
        return $this->state(fn (array $attributes) => [
            'jenis_mutasi' => 'masuk',
        ]);
    }

    /**
     * Indicate that the mutation is a stock exit (keluar).
     */
    public function keluar(): static
    {
        return $this->state(fn (array $attributes) => [
            'jenis_mutasi' => 'keluar',
        ]);
    }

    /**
     * Indicate that the mutation is an adjustment.
     */
    public function adjustment(): static
    {
        return $this->state(fn (array $attributes) => [
            'jenis_mutasi' => 'adjustment',
        ]);
    }
}
