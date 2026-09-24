export type SensorReading = {
  timestamp: string;
  temperature: number;
  vibration: number;
  energy: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
};

export type TwinAsset = {
  id: string;
  name: string;
  modelUrl?: string;
  pointCloudUrl?: string;
  lod: 0 | 1 | 2 | 3;
};

export async function fetchTelemetry(assetId: string, signal?: AbortSignal): Promise<SensorReading[]> {
  const response = await fetch(`/api/telemetry?asset=${encodeURIComponent(assetId)}`, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`Telemetry request failed: ${response.status}`);
  return response.json();
}

export function subscribeTelemetryWebSocket(url: string, onReading: (reading: SensorReading) => void) {
  const socket = new WebSocket(url);
  socket.onmessage = (event) => {
    try { onReading(JSON.parse(event.data) as SensorReading); } catch { /* Ignore malformed device messages. */ }
  };
  return () => socket.close();
}

export async function subscribeTelemetryMqtt(brokerUrl: string, topic: string, onReading: (reading: SensorReading) => void) {
  const mqtt = await import('mqtt');
  const client = mqtt.connect(brokerUrl);
  client.on('message', (_receivedTopic, payload) => {
    try { onReading(JSON.parse(payload.toString()) as SensorReading); } catch { /* Ignore malformed device messages. */ }
  });
  client.subscribe(topic);
  return () => client.end();
}

export function getLodForDistance(distance: number): 0 | 1 | 2 | 3 {
  if (distance < 25) return 3;
  if (distance < 100) return 2;
  if (distance < 300) return 1;
  return 0;
}

export async function saveTelemetryToRepository(reading: SensorReading, assetId: string) {
  const response = await fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetId, reading }),
  });
  if (!response.ok) throw new Error(`Telemetry persistence failed: ${response.status}`);
  return response.json();
}
