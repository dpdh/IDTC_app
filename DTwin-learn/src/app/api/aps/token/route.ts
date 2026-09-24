import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.APS_CLIENT_ID;
  const clientSecret = process.env.APS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ configured: false, message: 'APS belum dikonfigurasi.' }, { status: 200 });
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'viewables:read' }),
    cache: 'no-store',
  });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
