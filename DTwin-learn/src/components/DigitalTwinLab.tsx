"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, OrbitControls, Stage, useGLTF } from '@react-three/drei';
import type { Group } from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Bell, Database, Layers3, Play, Radio, RotateCcw, Wifi } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchTelemetry, getLodForDistance, type SensorReading } from '@/lib/integrations';
import APSViewer from './APSViewer';

function ProceduralFactory({ anomaly }: { anomaly: boolean }) {
  const group = useRef<Group>(null);
  const accent = anomaly ? '#ff76b8' : '#63e7ff';
  const energy = anomaly ? '#ff9ed0' : '#9be8ff';

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.position.y = Math.sin(Date.now() * 0.0013) * 0.06;
  });

  return (
    <group ref={group}>
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[13.5, 0.9, 10.5]} />
        <meshStandardMaterial color="#0d1b2b" metalness={0.8} roughness={0.25} />
      </mesh>

      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[11.2, 0.3, 8.5]} />
        <meshStandardMaterial color="#16395a" metalness={0.75} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[8.8, 0.18, 7.1]} />
        <meshStandardMaterial color="#203d61" metalness={0.8} roughness={0.28} />
      </mesh>

      {Array.from({ length: 8 }, (_, floor) => {
        const y = 0.8 + floor * 0.95;
        const width = 7.3 - floor * 0.18;
        const depth = 5.2 - floor * 0.12;

        return (
          <group key={floor} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[width, 0.78, depth]} />
              <meshStandardMaterial color="#102d4e" metalness={0.85} roughness={0.2} />
            </mesh>

            {[-2.2, -1.05, 0, 1.05, 2.2].map((x) => (
              <mesh key={`panel-${floor}-${x}`} position={[x, 0.01, 2.54]}>
                <boxGeometry args={[0.9, 0.56, 0.05]} />
                <meshStandardMaterial color={energy} emissive={energy} emissiveIntensity={1.8} />
              </mesh>
            ))}

            {[-2.2, -1.1, 0, 1.1, 2.2].map((x) => (
              <mesh key={`window-${floor}-${x}`} position={[x, 0.02, -2.57]}>
                <boxGeometry args={[0.8, 0.56, 0.05]} />
                <meshStandardMaterial color="#dffaff" emissive="#8fe9ff" emissiveIntensity={1.3} transparent opacity={0.88} />
              </mesh>
            ))}

            <mesh position={[2.95, 0.02, 0]}>
              <boxGeometry args={[0.2, 0.65, 2.6]} />
              <meshStandardMaterial color="#b5ebff" emissive="#7ad8ff" emissiveIntensity={1.6} />
            </mesh>
            <mesh position={[-2.95, 0.02, 0]}>
              <boxGeometry args={[0.2, 0.65, 2.6]} />
              <meshStandardMaterial color="#b5ebff" emissive="#7ad8ff" emissiveIntensity={1.6} />
            </mesh>
          </group>
        );
      })}

      {[-3.2, -1.7, 0, 1.7, 3.2].map((x) => (
        <mesh key={`light-${x}`} position={[x, 2.6, 3.02]}>
          <boxGeometry args={[0.72, 0.14, 0.08]} />
          <meshStandardMaterial color="#edfaff" emissive="#ebffff" emissiveIntensity={2.2} />
        </mesh>
      ))}

      {[-3.4, -1.7, 0, 1.7, 3.4].map((x) => (
        <mesh key={`cctv-${x}`} position={[x, 8.1, 3.16]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.2, 0.22, 0.3]} />
          <meshStandardMaterial color="#091827" metalness={0.8} roughness={0.25} />
        </mesh>
      ))}

      {[-4.2, -2.4, -0.6, 1.2, 3.1, 4.8].map((x) => (
        <mesh key={`duct-${x}`} position={[x, 4.2, -3.2]}>
          <boxGeometry args={[0.32, 1.1, 0.3]} />
          <meshStandardMaterial color="#8ec5ff" emissive="#8ec5ff" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {[-4.3, -2.8, -1.1, 0.5, 2.2, 3.8].map((x) => (
        <mesh key={`env-${x}`} position={[x, 1.1, -3.6]}>
          <boxGeometry args={[1.15, 0.12, 0.12]} />
          <meshStandardMaterial color="#75e3b0" emissive="#75e3b0" emissiveIntensity={1.5} />
        </mesh>
      ))}

      <mesh position={[0, 8.7, 0]}>
        <boxGeometry args={[8.8, 0.18, 5.9]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} metalness={0.9} roughness={0.18} />
      </mesh>

      <mesh position={[-4.1, 3.6, 0]}>
        <boxGeometry args={[0.28, 7.5, 0.22]} />
        <meshStandardMaterial color="#8ac8ff" emissive="#8ac8ff" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[4.1, 3.6, 0]}>
        <boxGeometry args={[0.28, 7.5, 0.22]} />
        <meshStandardMaterial color="#8ac8ff" emissive="#8ac8ff" emissiveIntensity={0.9} />
      </mesh>

      <mesh position={[0, 3.3, 3.55]}>
        <boxGeometry args={[8.2, 6.1, 0.12]} />
        <meshStandardMaterial color="#dffaff" emissive="#dffaff" emissiveIntensity={1.3} transparent opacity={0.75} />
      </mesh>

      <mesh position={[-5.5, 1.6, 1.8]}>
        <boxGeometry args={[0.8, 2.2, 1.1]} />
        <meshStandardMaterial color="#0a2037" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[5.5, 1.6, 1.8]}>
        <boxGeometry args={[0.8, 2.2, 1.1]} />
        <meshStandardMaterial color="#0a2037" metalness={0.7} roughness={0.4} />
      </mesh>

      <mesh position={[0, 9.5, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.85, 18]} />
        <meshStandardMaterial color="#f7b86a" emissive="#f7b86a" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 10.15, 0]}>
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshStandardMaterial color="#ffd7a5" emissive="#ffd7a5" emissiveIntensity={1.5} />
      </mesh>

      {[-6.5, -3.8, 3.8, 6.5].map((x) => (
        <mesh key={`site-light-${x}`} position={[x, 0.2, 4.4]}>
          <cylinderGeometry args={[0.08, 0.08, 0.45, 8]} />
          <meshStandardMaterial color="#78e8ff" emissive="#78e8ff" emissiveIntensity={1.8} />
        </mesh>
      ))}

      <mesh position={[0, 0.15, 5.8]}>
        <boxGeometry args={[15, 0.12, 0.8]} />
        <meshStandardMaterial color="#7ec8ff" emissive="#7ec8ff" emissiveIntensity={0.8} />
      </mesh>

      <mesh position={[0, 0.25, -6.2]}>
        <boxGeometry args={[12, 0.12, 0.8]} />
        <meshStandardMaterial color="#7ec8ff" emissive="#7ec8ff" emissiveIntensity={0.8} />
      </mesh>

      <mesh position={[7.3, 0.18, 0]}>
        <boxGeometry args={[0.8, 0.12, 10.5]} />
        <meshStandardMaterial color="#75e3b0" emissive="#75e3b0" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[-7.3, 0.18, 0]}>
        <boxGeometry args={[0.8, 0.12, 10.5]} />
        <meshStandardMaterial color="#75e3b0" emissive="#75e3b0" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

function GlbAsset({ url, anomaly }: { url: string; anomaly: boolean }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clone} scale={anomaly ? 1.03 : 1} />;
}

export function ThreeTwinScene({ modelUrl, anomaly }: { modelUrl?: string; anomaly: boolean }) {
  return <Canvas camera={{ position: [5, 3.2, 6], fov: 42 }} dpr={[1, 2]}><color attach="background" args={['#07111f']} /><ambientLight intensity={0.65} /><directionalLight position={[4, 6, 3]} intensity={2} color="#b3edff" /><Stage environment="city" intensity={0.5} adjustCamera={false}>{modelUrl ? <GlbAsset url={modelUrl} anomaly={anomaly} /> : <ProceduralFactory anomaly={anomaly} />}</Stage><Grid args={[14, 14]} cellColor="#214765" sectionColor="#78e8ff" fadeDistance={18} infiniteGrid /><OrbitControls enablePan={false} minDistance={3.5} maxDistance={10} /></Canvas>;
}

function nextLiveReading(previous: SensorReading): SensorReading {
  const drift = (amount: number) => (Math.random() - 0.5) * amount;
  const temperature = Math.min(76, Math.max(68, previous.temperature + drift(0.32) + (72 - previous.temperature) * 0.035));
  const vibration = Math.min(1.65, Math.max(0.72, previous.vibration + drift(0.08) + (1.15 - previous.vibration) * 0.08));
  const energy = Math.min(1360, Math.max(1080, previous.energy + drift(24) + (1220 - previous.energy) * 0.04));

  return {
    timestamp: new Date().toISOString(),
    temperature: Number(temperature.toFixed(1)),
    vibration: Number(vibration.toFixed(2)),
    energy: Math.round(energy),
    status: temperature > 75 || vibration > 1.5 ? 'WARNING' : 'NORMAL',
  };
}

export default function DigitalTwinLab() {
  const [anomaly, setAnomaly] = useState(false);
  const [running, setRunning] = useState(true);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const modelUrl = process.env.NEXT_PUBLIC_TWIN_MODEL_URL;
  const lod = getLodForDistance(64);

  useEffect(() => {
    const controller = new AbortController();
    fetchTelemetry('factory-01', controller.signal).then(setReadings).catch(() => setReadings([]));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!running) return;

    const interval = window.setInterval(() => {
      setReadings((previous) => {
        const current = previous.at(-1) ?? {
          timestamp: new Date().toISOString(),
          temperature: 72.8,
          vibration: 1.2,
          energy: 1248,
          status: 'NORMAL' as const,
        };
        return [...previous, nextLiveReading(current)].slice(-30);
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  const chartData = readings.map((item, index) => ({
    time: `${index + 1}m`,
    suhu: anomaly ? item.temperature + 13.6 : item.temperature,
  }));

  const latest = readings.at(-1) ?? {
    temperature: 72.8,
    vibration: 1.2,
    energy: 1248,
    status: 'NORMAL' as const,
  };

  const temperature = anomaly ? (latest.temperature + 13.6).toFixed(1) : latest.temperature.toFixed(1);
  const vibration = anomaly ? (latest.vibration + 2.6).toFixed(2) : latest.vibration.toFixed(2);

  return (
    <section className="integrated-lab">
      <div className="integration-strip">
        <span><Radio size={14} /> REST telemetry</span>
        <span><Wifi size={14} /> WebSocket ready</span>
        <span><Activity size={14} /> MQTT adapter</span>
        <span><Database size={14} /> Timescale/Supabase ready</span>
        <span><Layers3 size={14} /> LOD {lod} / point cloud ready</span>
      </div>

      <div className="integrated-lab-grid">
        <aside className="integrated-assets">
          <span className="eyebrow">ASSET MONITOR</span>
          <h3>Daftar aset</h3>
          {[['Mesin Produksi', 'Operational'], ['HVAC Unit 04', 'Operational'], ['Panel Energi', 'Warning'], ['Sensor Suhu', 'Operational'], ['Sensor Getaran', 'Critical']].map(([name, status]) => (
            <button className="integrated-asset" key={name}>
              <span className="asset-pulse" />
              <span>
                <b>{name}</b>
                <small className={status === 'Critical' ? 'red' : status === 'Warning' ? 'yellow' : 'green'}>{status}</small>
              </span>
              <span>›</span>
            </button>
          ))}
        </aside>

        <div className="integrated-canvas">
          <div className="integrated-toolbar">
            <span><span className="live-dot" /> {running ? 'SIMULATION RUNNING' : 'SIMULATION PAUSED'}</span>
            <span>{modelUrl ? 'GLB / GLTF LOADED' : 'PROCEDURAL FALLBACK'} • FACTORY-01</span>
          </div>
          <div className="three-stage">
            <ThreeTwinScene modelUrl={modelUrl} anomaly={anomaly} />
          </div>
          <div className="three-caption">Drag untuk orbit • scroll untuk zoom • model LOD aktif</div>
        </div>

        <aside className="integrated-telemetry">
          <div className="telemetry-title">
            <span className="eyebrow">LIVE TELEMETRY</span>
            <span className="source-badge">{readings.length ? 'REST CONNECTED' : 'DUMMY STREAM'}</span>
          </div>

          <div className="integrated-metric">
            <span>Suhu mesin</span>
            <strong className={anomaly ? 'hot' : ''}>{temperature}<small> °C</small></strong>
            <em className={anomaly ? 'hot' : ''}>{anomaly ? '+18.4%' : '+4.2%'}</em>
          </div>

          <div className="integrated-metric">
            <span>Getaran</span>
            <strong className={anomaly ? 'hot' : ''}>{vibration}<small> mm/s</small></strong>
            <em className={anomaly ? 'hot' : ''}>{anomaly ? '+42.8%' : '-2.1%'}</em>
          </div>

          <div className="integrated-metric">
            <span>Konsumsi energi</span>
            <strong>{latest.energy.toLocaleString()}<small> kWh</small></strong>
            <em>-8.4%</em>
          </div>

          <div className="integrated-metric">
            <span>Status mesin</span>
            <strong className={anomaly ? 'hot' : 'good'}>{anomaly ? 'WARNING' : latest.status}</strong>
          </div>

          <div className="integrated-chart">
            <div><span>Temperature trend</span><small>last 30 min</small></div>
            <ResponsiveContainer width="100%" height={115}>
              <LineChart data={chartData.length ? chartData : [{ time: '1m', suhu: 72 }, { time: '2m', suhu: 73 }]}>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ background: '#0b192c', border: '1px solid #34516f', fontSize: 10 }} />
                <Line type="monotone" dataKey="suhu" stroke={anomaly ? '#ff76b8' : '#78e8ff'} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="integrated-actions">
            <button onClick={() => { setAnomaly(false); setRunning(false); }}><RotateCcw size={14} /> Reset</button>
            <button className="primary" onClick={() => setRunning(!running)}><Play size={14} /> {running ? 'Jeda' : 'Mulai'}</button>
            <button className="anomaly" onClick={() => setAnomaly(!anomaly)}><Bell size={14} /> {anomaly ? 'Pulihkan' : 'Generate anomali'}</button>
          </div>
        </aside>
      </div>

      <div className="aps-panel">
        <div className="aps-panel-heading">
          <span>
            <span className="eyebrow">AUTODESK PLATFORM SERVICES</span>
            <b>APS Model Viewer + Labels Cluster</b>
          </span>
          <span>GLB / GLTF</span>
        </div>
        <APSViewer />
      </div>
    </section>
  );
}
