<?php

use App\Models\Content;
use App\Models\Project;
use App\Http\Controllers\DinaAiController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MidtransPaymentController;
use Illuminate\Support\Facades\Route;

Route::post('/dina-ai/chat', [DinaAiController::class, 'chat']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/payments/midtrans/snap', [MidtransPaymentController::class, 'createSnapTransaction']);
Route::post('/payments/midtrans/notification', [MidtransPaymentController::class, 'notification']);

Route::get('/idtc/bootstrap', function () {
    return response()->json([
        'app' => 'IDTC',
        'version' => '1.0.0',
        'projects' => Project::query()
            ->orderBy('name')
            ->get([
                'id',
                'slug',
                'name',
                'facility_type',
                'status',
                'health_score',
                'description',
                'aps_project_id',
                'aps_hub_id',
                'model_urn',
                'metadata',
                'updated_at',
            ]),
        'contents' => Content::query()
            ->where('status', 'published')
            ->with(['sections' => fn ($query) => $query->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get([
                'id',
                'project_id',
                'slug',
                'title',
                'content_type',
                'status',
                'excerpt',
                'description',
                'sort_order',
                'published_at',
            ]),
    ]);
});

Route::get('/idtc/health', fn () => response()->json([
    'service' => 'idtc_db',
    'status' => 'ok',
]));
