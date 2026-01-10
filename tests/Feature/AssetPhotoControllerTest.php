<?php

use App\Models\Asset;
use App\Models\AssetPhoto;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('AssetPhotoController', function () {
    describe('Index', function () {
        it('requires authentication', function () {
            $asset = Asset::factory()->create();

            $response = $this->get(route('assets.photos.index', $asset->id));

            $response->assertRedirect(route('login'));
        });

        it('returns photos for an asset', function () {
            $user = User::factory()->create();
            $asset = Asset::factory()->create();
            AssetPhoto::factory()->count(3)->create(['asset_id' => $asset->id]);

            $response = $this->actingAs($user)
                ->get(route('assets.photos.index', $asset->id));

            $response->assertStatus(200)
                ->assertJsonCount(3);
        });
    });

    describe('Store', function () {
        it('requires authentication', function () {
            $asset = Asset::factory()->create();

            $response = $this->post(route('assets.photos.store', $asset->id), []);

            $response->assertRedirect(route('login'));
        });

        it('uploads a photo successfully', function () {
            Storage::fake('public');

            $user = User::factory()->create();
            $asset = Asset::factory()->create();
            $file = UploadedFile::fake()->image('photo.jpg');

            $response = $this->actingAs($user)
                ->post(route('assets.photos.store', $asset->id), [
                    'photo' => $file,
                    'caption' => 'Test photo',
                ]);

            $response->assertStatus(201)
                ->assertJson([
                    'message' => 'Photo uploaded successfully',
                ]);

            Storage::disk('public')->assertExists('asset-photos/'.$file->hashName());
            $this->assertDatabaseHas('asset_photos', [
                'asset_id' => $asset->id,
                'caption' => 'Test photo',
            ]);
        });

        it('validates file type', function () {
            Storage::fake('public');

            $user = User::factory()->create();
            $asset = Asset::factory()->create();
            $file = UploadedFile::fake()->create('document.pdf', 1000);

            $response = $this->actingAs($user)
                ->post(route('assets.photos.store', $asset->id), [
                    'photo' => $file,
                ]);

            $response->assertStatus(302)
                ->assertSessionHasErrors(['photo']);
        });

        it('validates file size', function () {
            Storage::fake('public');

            $user = User::factory()->create();
            $asset = Asset::factory()->create();
            $file = UploadedFile::fake()->image('photo.jpg')->size(10240); // 10MB

            $response = $this->actingAs($user)
                ->post(route('assets.photos.store', $asset->id), [
                    'photo' => $file,
                ]);

            $response->assertStatus(302)
                ->assertSessionHasErrors(['photo']);
        });

        it('marks first photo as primary', function () {
            Storage::fake('public');

            $user = User::factory()->create();
            $asset = Asset::factory()->create();
            $file = UploadedFile::fake()->image('photo.jpg');

            $response = $this->actingAs($user)
                ->post(route('assets.photos.store', $asset->id), [
                    'photo' => $file,
                ]);

            $response->assertStatus(201);

            $this->assertDatabaseHas('asset_photos', [
                'asset_id' => $asset->id,
                'is_primary' => true,
            ]);
        });
    });

    describe('Update', function () {
        it('requires authentication', function () {
            $asset = Asset::factory()->create();
            $photo = AssetPhoto::factory()->create(['asset_id' => $asset->id]);

            $response = $this->put(route('assets.photos.update', [$asset->id, $photo->id]), []);

            $response->assertRedirect(route('login'));
        });

        it('updates photo caption', function () {
            $user = User::factory()->create();
            $asset = Asset::factory()->create();
            $photo = AssetPhoto::factory()->create([
                'asset_id' => $asset->id,
                'caption' => 'Old caption',
            ]);

            $response = $this->actingAs($user)
                ->put(route('assets.photos.update', [$asset->id, $photo->id]), [
                    'caption' => 'New caption',
                ]);

            $response->assertStatus(200);

            $this->assertDatabaseHas('asset_photos', [
                'id' => $photo->id,
                'caption' => 'New caption',
            ]);
        });

        it('marks photo as primary', function () {
            $user = User::factory()->create();
            $asset = Asset::factory()->create();
            $photo1 = AssetPhoto::factory()->create([
                'asset_id' => $asset->id,
                'is_primary' => true,
            ]);
            $photo2 = AssetPhoto::factory()->create([
                'asset_id' => $asset->id,
                'is_primary' => false,
            ]);

            $response = $this->actingAs($user)
                ->put(route('assets.photos.update', [$asset->id, $photo2->id]), [
                    'is_primary' => true,
                ]);

            $response->assertStatus(200);

            $this->assertDatabaseHas('asset_photos', [
                'id' => $photo1->id,
                'is_primary' => false,
            ]);

            $this->assertDatabaseHas('asset_photos', [
                'id' => $photo2->id,
                'is_primary' => true,
            ]);
        });
    });

    describe('Destroy', function () {
        it('requires authentication', function () {
            $asset = Asset::factory()->create();
            $photo = AssetPhoto::factory()->create(['asset_id' => $asset->id]);

            $response = $this->delete(route('assets.photos.destroy', [$asset->id, $photo->id]));

            $response->assertRedirect(route('login'));
        });

        it('deletes a photo successfully', function () {
            Storage::fake('public');

            $user = User::factory()->create();
            $asset = Asset::factory()->create();
            $photo = AssetPhoto::factory()->create([
                'asset_id' => $asset->id,
                'file_path' => 'asset-photos/test.jpg',
            ]);

            Storage::disk('public')->put('asset-photos/test.jpg', 'test content');

            $response = $this->actingAs($user)
                ->delete(route('assets.photos.destroy', [$asset->id, $photo->id]));

            $response->assertStatus(200);

            $this->assertSoftDeleted('asset_photos', [
                'id' => $photo->id,
            ]);

            Storage::disk('public')->assertMissing('asset-photos/test.jpg');
        });
    });
});
