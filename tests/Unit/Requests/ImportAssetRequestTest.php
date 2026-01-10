<?php

use App\Http\Requests\ImportAssetRequest;
use Illuminate\Support\Facades\Validator;

describe('ImportAssetRequest', function () {
    describe('validation rules', function () {
        test('requires json_file field', function () {
            $request = new ImportAssetRequest;
            $rules = $request->rules();

            expect($rules)->toHaveKey('json_file');
            expect($rules['json_file'])->toContain('required');
            expect($rules['json_file'])->toContain('file');
        });

        test('requires json_file to be a json file', function () {
            $request = new ImportAssetRequest;
            $rules = $request->rules();

            expect($rules['json_file'])->toContain('mimes:json');
        });

        test('requires json_file to not exceed max size', function () {
            $request = new ImportAssetRequest;
            $rules = $request->rules();

            expect($rules['json_file'])->toContain('max:10240'); // 10MB
        });
    });

    describe('validation messages', function () {
        test('has custom messages', function () {
            $request = new ImportAssetRequest;
            $messages = $request->messages();

            expect($messages)->toBeArray();
        });
    });

    describe('validation attributes', function () {
        test('has custom attributes', function () {
            $request = new ImportAssetRequest;
            $attributes = $request->attributes();

            expect($attributes)->toBeArray();
            expect($attributes['json_file'])->toBe('file JSON');
        });
    });

    describe('authorize', function () {
        test('returns true for authenticated users', function () {
            $request = new ImportAssetRequest;
            expect($request->authorize())->toBeTrue();
        });
    });

    describe('actual validation', function () {
        test('fails when json_file is missing', function () {
            $validator = Validator::make([], (new ImportAssetRequest)->rules());

            expect($validator->fails())->toBeTrue();
            expect($validator->errors()->has('json_file'))->toBeTrue();
        });

        test('fails when json_file is not a file', function () {
            $validator = Validator::make([
                'json_file' => 'not a file',
            ], (new ImportAssetRequest)->rules());

            expect($validator->fails())->toBeTrue();
        });

        test('fails when json_file is not a json file', function () {
            $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('test.txt', 'content');

            $validator = Validator::make([
                'json_file' => $file,
            ], (new ImportAssetRequest)->rules());

            expect($validator->fails())->toBeTrue();
        });

        test('passes when json_file is a valid json file', function () {
            $content = '{"metadata": {}, "data": []}';
            $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('assets.json', $content);

            $validator = Validator::make([
                'json_file' => $file,
            ], (new ImportAssetRequest)->rules());

            expect($validator->fails())->toBeFalse();
        });

        test('fails when json_file exceeds max size', function () {
            $file = \Illuminate\Http\UploadedFile::fake()->create('large.json', 11 * 1024 + 1); // 11MB + 1 byte

            $validator = Validator::make([
                'json_file' => $file,
            ], (new ImportAssetRequest)->rules());

            expect($validator->fails())->toBeTrue();
        });
    });
});
