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

            // Create a minimal valid JPEG file (1x1 pixel black image)
            $tempPath = sys_get_temp_dir().'/test_photo_'.uniqid().'.jpg';
            // Minimal JPEG header (binary)
            $jpegData = "\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\xff\xc0\x00\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00?\x00\xff\xd9";
            file_put_contents($tempPath, $jpegData);

            $file = new UploadedFile(
                $tempPath,
                'photo.jpg',
                'image/jpeg',
                null,
                true
            );

            $response = $this->actingAs($user)
                ->post(route('assets.photos.store', $asset->id), [
                    'photo' => $file,
                    'caption' => 'Test photo',
                ]);

            $response->assertStatus(201)
                ->assertJson([
                    'message' => 'Photo uploaded successfully',
                ]);

            // Clean up temp file
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

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

            // Create a large JPEG file (10MB) by padding a valid JPEG
            $tempPath = sys_get_temp_dir().'/test_large_photo_'.uniqid().'.jpg';
            $jpegHeader = "\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\xff\xc0\x00\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00?\x00\xff\xd9";
            $padding = str_repeat("\x00", 10 * 1024 * 1024); // 10MB padding
            file_put_contents($tempPath, $jpegHeader.$padding);

            $file = new UploadedFile(
                $tempPath,
                'photo.jpg',
                'image/jpeg',
                null,
                true
            );

            $response = $this->actingAs($user)
                ->post(route('assets.photos.store', $asset->id), [
                    'photo' => $file,
                ]);

            $response->assertStatus(302)
                ->assertSessionHasErrors(['photo']);

            // Clean up temp file
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }
        });

        it('marks first photo as primary', function () {
            Storage::fake('public');

            $user = User::factory()->create();
            $asset = Asset::factory()->create();

            // Create a minimal valid JPEG file (1x1 pixel black image)
            $tempPath = sys_get_temp_dir().'/test_primary_photo_'.uniqid().'.jpg';
            // Minimal JPEG header (binary)
            $jpegData = "\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\xff\xc0\x00\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00?\x00\xff\xd9";
            file_put_contents($tempPath, $jpegData);

            $file = new UploadedFile(
                $tempPath,
                'photo.jpg',
                'image/jpeg',
                null,
                true
            );

            $response = $this->actingAs($user)
                ->post(route('assets.photos.store', $asset->id), [
                    'photo' => $file,
                ]);

            $response->assertStatus(201);

            // Clean up temp file
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

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
