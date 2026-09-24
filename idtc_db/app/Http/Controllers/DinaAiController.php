<?php

namespace App\Http\Controllers;

use App\Services\DinaAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DinaAiController extends Controller
{
    public function __construct(private readonly DinaAiService $dinaAi) {}

    public function chat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'literacy_context' => ['nullable', 'string', 'max:250000'],
        ]);

        return response()->json($this->dinaAi->answer($data['message'], $data['literacy_context'] ?? ''));
    }
}
