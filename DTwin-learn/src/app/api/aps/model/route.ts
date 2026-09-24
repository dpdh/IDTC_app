import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const urn = typeof body.urn === 'string' ? body.urn.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : 'custom-model';

  if (!urn) {
    return NextResponse.json({ ok: false, message: 'URN model wajib diisi.' }, { status: 400 });
  }

  const token = process.env.APS_CLIENT_ID && process.env.APS_CLIENT_SECRET
    ? Buffer.from(`${process.env.APS_CLIENT_ID}:${process.env.APS_CLIENT_SECRET}`).toString('base64')
    : null;

  if (!token) {
    return NextResponse.json({
      ok: true,
      message: 'Model tercatat di UI lokal; APS credentials belum dikonfigurasi.',
      payload: { urn, name, localOnly: true },
    });
  }

  const tokenResponse = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'bucket:create bucket:read data:read data:write' }),
    cache: 'no-store',
  });

  if (!tokenResponse.ok) {
    return NextResponse.json({ ok: false, status: tokenResponse.status, message: 'Gagal mengakses APS token.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: 'Model siap dipakai di viewer APS.',
    payload: { urn, name, localOnly: false },
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    uploaded: [],
    message: 'Gunakan POST /api/aps/model untuk mendaftarkan URN model yang sudah dipindahkan ke bucket Autodesk.',
  });
}
