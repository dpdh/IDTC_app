import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getToken() {
  const clientId = process.env.APS_CLIENT_ID;
  const clientSecret = process.env.APS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
}

function getBucketKey() {
  return process.env.NEXT_PUBLIC_APS_BUCKET_KEY || 'twinlearn-bucket';
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');
  const bucketKey = String(formData.get('bucketKey') || getBucketKey());

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: 'File model tidak ditemukan.' }, { status: 400 });
  }

  const token = getToken();
  if (!token) {
    return NextResponse.json({ ok: false, message: 'APS_CLIENT_ID / APS_CLIENT_SECRET belum diisi.' }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'bucket:create bucket:read data:read data:write',
      }),
      cache: 'no-store',
    });

    const auth = await tokenResponse.json();
    if (!tokenResponse.ok || !auth.access_token) {
      return NextResponse.json({ ok: false, message: 'Gagal mendapatkan token APS.', details: auth }, { status: 500 });
    }

    const createBucketResponse = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucketKey, policyKey: 'persistent' }),
    });

    const bucketResult = await createBucketResponse.json().catch(() => ({}));
    if (!createBucketResponse.ok && bucketResult.reason !== 'BucketAlreadyExists') {
      return NextResponse.json({ ok: false, message: 'Gagal membuat bucket APS.', details: bucketResult }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(file.name)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: Buffer.from(arrayBuffer),
    });

    const uploadResult = await uploadResponse.json().catch(() => ({}));
    if (!uploadResponse.ok) {
      return NextResponse.json({ ok: false, message: 'Upload file ke APS gagal.', details: uploadResult }, { status: 500 });
    }

    const urn = Buffer.from(`urn:adsk.objects:os.object:${bucketKey}/${file.name}`).toString('base64');
    return NextResponse.json({
      ok: true,
      urn: `urn:adsk.objects:os.object:${bucketKey}/${file.name}`,
      encodedUrn: urn,
      bucketKey,
      fileName: file.name,
      message: `Model berhasil di-upload ke bucket APS: ${bucketKey}`,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: 'Terjadi error saat upload file ke APS.', details: String(error) }, { status: 500 });
  }
}
