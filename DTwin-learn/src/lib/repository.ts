import type { SensorReading } from './integrations';

export type TelemetryRepository = {
  save: (assetId: string, reading: SensorReading) => Promise<void>;
  latest: (assetId: string) => Promise<SensorReading[]>;
};

export const restTelemetryRepository: TelemetryRepository = {
  async save(assetId, reading) {
    await fetch('/api/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId, reading }) });
  },
  async latest(assetId) {
    const response = await fetch(`/api/telemetry?asset=${encodeURIComponent(assetId)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Repository read failed: ${response.status}`);
    return response.json();
  },
};

export const repositoryNotes = {
  postgres: 'Set DATABASE_URL or TIMESCALE_URL and replace the route persistence with a parameterized server query.',
  supabase: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server, then persist telemetry in a Supabase table.',
  timescale: 'Use a hypertable keyed by asset_id and timestamp for high-volume sensor history.',
};
