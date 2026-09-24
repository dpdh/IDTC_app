<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MidtransPaymentTest extends TestCase
{
    public function test_it_creates_a_snap_transaction_with_midtrans_headers_and_server_price(): void
    {
        config(['services.midtrans.server_key' => 'SB-Mid-server-test']);
        Http::fake([
            'https://app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
                'token' => 'snap-token',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token',
            ], 201),
        ]);

        $response = $this->postJson('/api/payments/midtrans/snap', [
            'product_id' => 'twini-mascot-plush',
        ]);

        $response->assertCreated()->assertJsonPath('token', 'snap-token');
        Http::assertSent(function ($request): bool {
            $payload = $request->data();
            return $request->hasHeader('Authorization')
                && $request->header('Content-Type')[0] === 'application/json'
                && $request->hasHeader('Idempotency-Key')
                && $payload['transaction_details']['gross_amount'] === 299000
                && $payload['item_details'][0]['id'] === 'twini-mascot-plush';
        });
    }

    public function test_it_rejects_an_unknown_product(): void
    {
        $this->postJson('/api/payments/midtrans/snap', ['product_id' => 'unknown-product'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['product_id']);
    }
}
