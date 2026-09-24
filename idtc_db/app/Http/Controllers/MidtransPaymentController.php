<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MidtransPaymentController extends Controller
{
    private const PRODUCTS = [
        'twini-mascot-plush' => [
            'name' => 'Boneka Maskot Twini',
            'price' => 299000,
        ],
        'twini-keychain' => [
            'name' => 'Gantungan Kunci Twini',
            'price' => 79000,
        ],
        'twini-tshirt' => [
            'name' => 'Kaos Twini Maskot IDTC',
            'price' => 179000,
        ],
        'idtc-tshirt-collection' => [
            'name' => 'Kaos IDTC Collection',
            'price' => 189000,
        ],
        'twini-lanyard' => [
            'name' => 'Lanyard Twini IDTC',
            'price' => 89000,
        ],
        'twini-notebook' => [
            'name' => 'Notebook Twini',
            'price' => 129000,
        ],
        'twini-polo' => [
            'name' => 'Kaos Polo Twini',
            'price' => 249000,
        ],
        'twini-tie' => [
            'name' => 'Dasi Twini IDTC',
            'price' => 159000,
        ],
        'idtc-jacket' => [
            'name' => 'Jaket IDTC',
            'price' => 499000,
        ],
        'twini-cap' => [
            'name' => 'Topi Twini',
            'price' => 159000,
        ],
    ];

    public function createSnapTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'string', 'in:' . implode(',', array_keys(self::PRODUCTS))],
            'customer' => ['nullable', 'array'],
            'customer.first_name' => ['nullable', 'string', 'max:50'],
            'customer.last_name' => ['nullable', 'string', 'max:50'],
            'customer.email' => ['nullable', 'email', 'max:100'],
            'customer.phone' => ['nullable', 'string', 'max:20'],
        ]);

        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '') {
            return response()->json(['message' => 'Midtrans Server Key belum dikonfigurasi.'], 503);
        }

        $product = self::PRODUCTS[$validated['product_id']];
        $orderId = 'IDTC-' . Str::upper(Str::random(20));
        $customer = $validated['customer'] ?? [];
        $payload = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $product['price'],
            ],
            'item_details' => [[
                'id' => $validated['product_id'],
                'price' => $product['price'],
                'quantity' => 1,
                'name' => $product['name'],
            ]],
            'credit_card' => ['secure' => true],
            'customer_details' => array_filter([
                'first_name' => $customer['first_name'] ?? 'IDTC',
                'last_name' => $customer['last_name'] ?? 'Customer',
                'email' => $customer['email'] ?? null,
                'phone' => $customer['phone'] ?? null,
            ]),
        ];

        $baseUrl = config('services.midtrans.production')
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';

        $response = Http::acceptJson()
            ->asJson()
            ->withBasicAuth($serverKey, '')
            ->withHeaders(['Idempotency-Key' => Str::uuid()->toString()])
            ->post($baseUrl . '/snap/v1/transactions', $payload);

        if ($response->failed()) {
            Log::error('Midtrans Snap transaction failed', [
                'status' => $response->status(),
                'body' => $response->json(),
                'order_id' => $orderId,
            ]);

            return response()->json(['message' => 'Transaksi Midtrans gagal dibuat.'], $response->status() >= 500 ? 502 : 422);
        }

        return response()->json([
            'order_id' => $orderId,
            'token' => $response->json('token'),
            'redirect_url' => $response->json('redirect_url'),
        ], 201);
    }

    public function notification(Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = hash('sha512', implode('', [
            $payload['order_id'] ?? '',
            $payload['status_code'] ?? '',
            $payload['gross_amount'] ?? '',
            config('services.midtrans.server_key'),
        ]));

        if (!hash_equals($signature, (string) ($payload['signature_key'] ?? ''))) {
            return response()->json(['message' => 'Invalid signature.'], 403);
        }

        Log::info('Midtrans payment notification received', [
            'order_id' => $payload['order_id'] ?? null,
            'transaction_status' => $payload['transaction_status'] ?? null,
            'fraud_status' => $payload['fraud_status'] ?? null,
        ]);

        return response()->json(['status' => 'ok']);
    }
}
