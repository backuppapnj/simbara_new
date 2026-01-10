<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('AssetPhoto Model', function () {
    it('can be instantiated', function () {
        $assetPhoto = new \App\Models\AssetPhoto;

        expect($assetPhoto)->not->toBeNull();
    });

    it('has correct table name', function () {
        $assetPhoto = new \App\Models\AssetPhoto;

        expect($assetPhoto->getTable())->toBe('asset_photos');
    });

    it('has fillable attributes', function () {
        $assetPhoto = new \App\Models\AssetPhoto;

        expect($assetPhoto->getFillable())->toContain('asset_id');
        expect($assetPhoto->getFillable())->toContain('file_path');
        expect($assetPhoto->getFillable())->toContain('file_name');
        expect($assetPhoto->getFillable())->toContain('file_size');
        expect($assetPhoto->getFillable())->toContain('mime_type');
        expect($assetPhoto->getFillable())->toContain('caption');
        expect($assetPhoto->getFillable())->toContain('is_primary');
    });

    it('has timestamps', function () {
        $assetPhoto = new \App\Models\AssetPhoto;

        expect($assetPhoto->timestamps)->toBeTrue();
    });

    it('uses ULID as primary key', function () {
        $assetPhoto = new \App\Models\AssetPhoto;

        expect($assetPhoto->getKeyName())->toBe('id');
        expect($assetPhoto->getKeyType())->toBe('string');
        expect($assetPhoto->getIncrementing())->toBeFalse();
    });

    it('generates ULID on creation', function () {
        $asset = \App\Models\Asset::factory()->create();
        $assetPhoto = \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
        ]);

        expect($assetPhoto->id)->not->toBeEmpty();
        expect(strlen($assetPhoto->id))->toBe(26);
    });

    it('belongs to an asset', function () {
        $asset = \App\Models\Asset::factory()->create();
        $assetPhoto = \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
        ]);

        expect($assetPhoto->asset)->toBeInstanceOf(\App\Models\Asset::class);
        expect($assetPhoto->asset->id)->toBe($asset->id);
    });

    it('casts is_primary to boolean', function () {
        $asset = \App\Models\Asset::factory()->create();
        $assetPhoto = \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
            'is_primary' => true,
        ]);

        expect($assetPhoto->is_primary)->toBeBool();
        expect($assetPhoto->is_primary)->toBeTrue();
    });

    it('casts file_size to integer', function () {
        $asset = \App\Models\Asset::factory()->create();
        $assetPhoto = \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
            'file_size' => 123456,
        ]);

        expect($assetPhoto->file_size)->toBeInt();
        expect($assetPhoto->file_size)->toBe(123456);
    });

    it('can be marked as primary photo', function () {
        $asset = \App\Models\Asset::factory()->create();

        $photo1 = \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
            'is_primary' => true,
        ]);

        $photo2 = \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
            'is_primary' => false,
        ]);

        expect($photo1->is_primary)->toBeTrue();
        expect($photo2->is_primary)->toBeFalse();
    });

    it('has scope to get primary photos', function () {
        $asset = \App\Models\Asset::factory()->create();

        \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
            'is_primary' => false,
        ]);

        $primaryPhoto = \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
            'is_primary' => true,
        ]);

        $primaryPhotos = \App\Models\AssetPhoto::primary()->get();

        expect($primaryPhotos)->toHaveCount(1);
        expect($primaryPhotos->first()->id)->toBe($primaryPhoto->id);
    });

    it('deletes photo file when model is deleted', function () {
        Storage::fake('public');

        $asset = \App\Models\Asset::factory()->create();
        $assetPhoto = \App\Models\AssetPhoto::factory()->create([
            'asset_id' => $asset->id,
            'file_path' => 'asset-photos/test-photo.jpg',
        ]);

        Storage::disk('public')->put('asset-photos/test-photo.jpg', 'test content');

        expect(Storage::disk('public')->exists('asset-photos/test-photo.jpg'))->toBeTrue();

        $assetPhoto->delete();

        expect(Storage::disk('public')->exists('asset-photos/test-photo.jpg'))->toBeFalse();
    });
});
