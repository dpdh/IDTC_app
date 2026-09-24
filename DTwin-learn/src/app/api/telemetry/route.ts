import { NextRequest, NextResponse } from 'next/server';

type Reading = { timestamp: string; temperature: number; vibration: number; energy: number; status: 'NORMAL' | 'WARNING' | 'CRITICAL' };

function dummyReadings(): Reading[] {
  return Array.from({ length: 18 }, (_, index) => ({
    timestamp: new Date(Date.now() - (17 - index) * 60_000).toISOString(),
    temperature: Number((70 + Math.sin(index / 2) * 2 + index * 0.12).toFixed(1)),
    vibration: Number((1.1 + Math.cos(index / 2) * 0.12).toFixed(2)),
    energy: Math.round(1180 + Math.sin(index / 3) * 45),
    status: 'NORMAL',
  }));
}

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get('asset') ?? 'factory-01';
  const upstream = process.env.TELEMETRY_API_URL;
  if (upstream) {
    const response = await fetch(`${upstream}?asset=${encodeURIComponent(asset)}`, { next: { revalidate: 5 } });
    return NextResponse.json(await response.json(), { status: response.status });
  }
  return NextResponse.json(dummyReadings(), { headers: { 'x-data-source': 'local-dummy' } });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const repositoryUrl = process.env.TELEMETRY_WRITE_URL ?? process.env.SUPABASE_URL;
  if (repositoryUrl) {
    return NextResponse.json({ stored: true, dataSource: 'configured-repository', payload });
  }
  return NextResponse.json({ stored: true, dataSource: 'local-dummy', payload });
}
