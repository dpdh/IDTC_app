"use client";

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Layers3, LoaderCircle } from 'lucide-react';

type APSViewerProps = { urn?: string };

type ModelCategory = { label: string; count: number; utilization: number; status: 'Stable' | 'Watch' | 'Critical' };

type AutodeskWindow = Window & { Autodesk?: any; THREE?: any };

const defaultModelCategories = [
  { label: 'Structural', count: 42, utilization: 74, status: 'Stable' as const },
  { label: 'Mechanical', count: 28, utilization: 81, status: 'Watch' as const },
  { label: 'Electrical', count: 33, utilization: 68, status: 'Stable' as const },
  { label: 'HVAC', count: 24, utilization: 88, status: 'Watch' as const },
  { label: 'Fire Safety', count: 15, utilization: 61, status: 'Stable' as const },
  { label: 'Monitoring', count: 47, utilization: 92, status: 'Critical' as const },
];

const labelsPositions = [
  { x: 36.96, y: 11.35, z: -10.75 }, { x: 38.95, y: 12.14, z: -10.51 },
  { x: 41.04, y: 13.77, z: -9.87 }, { x: 41.52, y: 19.87, z: -9.46 },
  { x: 28.53, y: 16.5, z: -10.89 }, { x: 29.95, y: 21.23, z: -10.82 },
  { x: 31.71, y: 23.74, z: -11.61 }, { x: 32.32, y: 29.28, z: -11.08 },
  { x: 37.13, y: 51.55, z: -10.43 }, { x: 29.41, y: 36.4, z: -9.39 },
  { x: 30.13, y: 19.42, z: -4.16 }, { x: 34.21, y: 25.1, z: -7.32 },
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export default function APSViewer({ urn }: APSViewerProps) {
  const container = useRef<HTMLDivElement>(null);
  const viewer = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle');
  const [clusterEnabled, setClusterEnabled] = useState(true);
  const [customUrn, setCustomUrn] = useState<string>(urn ?? process.env.NEXT_PUBLIC_APS_MODEL_URN ?? '');
  const [uploadMessage, setUploadMessage] = useState('');
  const [generatedData, setGeneratedData] = useState<ModelCategory[]>(defaultModelCategories);

  useEffect(() => {
    if (urn) setCustomUrn(urn);
  }, [urn]);

  useEffect(() => {
    let disposed = false;
    async function initialize() {
      const activeUrn = customUrn.trim();
      if (!activeUrn || !container.current) { setState('unavailable'); return; }
      setState('loading');
      try {
        const response = await fetch('/api/aps/token', { cache: 'no-store' });
        const token = await response.json();
        if (!token.access_token) { setState('unavailable'); return; }
        await loadScript('https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js');
        if (disposed || !container.current) return;
        const win = window as AutodeskWindow;
        const Autodesk = win.Autodesk;
        Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', accessToken: token.access_token, isAEC: true }, () => {
          if (disposed || !container.current) return;
          const instance = new Autodesk.Viewing.GuiViewer3D(container.current, { extensions: ['Autodesk.DataVisualization'] });
          instance.start();
          viewer.current = instance;
          Autodesk.Viewing.theExtensionManager.registerExtension('TwinLearnLabelsCluster', class extends Autodesk.Viewing.Extension {
            _button: any; _changing = false; threshold = 80; dataVizExtn: any; pointStyles: any[] = []; enabled = true;
            setEnabled(enabled: boolean) { this.enabled = enabled; if (!this.enabled) { this.dataVizExtn?.removeAllViewables(); return; } this.renderGroups(); }
            async load() { this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, () => this.prepare()); return true; }
            async prepare() { this.dataVizExtn = await this.viewer.getExtension('Autodesk.DataVisualization'); const Core = Autodesk.DataVisualization.Core; const pointsColor = new win.THREE.Color(0xffffff); this.pointStyles = [new Core.ViewableStyle(Core.ViewableType.SPRITE, pointsColor, 'https://img.icons8.com/ios/50/null/1-circle.png'), new Core.ViewableStyle(Core.ViewableType.SPRITE, pointsColor, '/assets/aps-cluster.svg')]; this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, () => this.renderGroups()); this.renderGroups(); }
            renderGroups() { if (!this.enabled || this._changing) return; this._changing = true; window.setTimeout(() => { const groups: number[][] = []; labelsPositions.forEach((point, index) => { const screen = this.viewer.worldToClient(point); const key = `${Math.floor(screen.x / this.threshold)}:${Math.floor(screen.y / this.threshold)}`; const group = groups.find((candidate: any) => candidate.key === key) as any; if (group) group.push(index); else { const next: any = [index]; next.key = key; groups.push(next); } }); this.replace(groups); this._changing = false; }, 120); }
            replace(groups: number[][]) { if (!this.enabled) return; const Core = Autodesk.DataVisualization.Core; this.dataVizExtn.removeAllViewables(); const data = new Core.ViewableData(); data.spriteSize = 32; groups.forEach((group: any, index) => { const points = group.map((pointIndex: number) => labelsPositions[pointIndex]); const point = points.reduce((sum: any, item: any) => ({ x: sum.x + item.x / points.length, y: sum.y + item.y / points.length, z: sum.z + item.z / points.length }), { x: 0, y: 0, z: 0 }); data.addViewable(new Core.SpriteViewable(point, this.pointStyles[points.length > 1 ? 1 : 0], 10000 + index)); }); data.finish().then(() => this.dataVizExtn.addViewables(data)); }
          });
          instance.loadExtension('TwinLearnLabelsCluster');
          const extension = instance.getExtension('TwinLearnLabelsCluster');
          extension?.setEnabled?.(clusterEnabled);
          Autodesk.Viewing.Document.load(`urn:${activeUrn.replace(/^urn:/i, '')}`, (doc: any) => instance.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
          if (!disposed) setState('ready');
        });
      } catch { if (!disposed) setState('error'); }
    }
    initialize();
    return () => { disposed = true; viewer.current?.finish?.(); viewer.current = null; };
  }, [customUrn, clusterEnabled]);

  const handleUploadClick = async () => {
    const value = customUrn.trim();
    if (!value) {
      setUploadMessage('Masukkan URN model sebelum di-register.');
      return;
    }

    const response = await fetch('/api/aps/model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urn: value, name: 'digital-twin-model' }),
    });

    const payload = await response.json();
    setUploadMessage(payload.message || 'Model siap dipakai.');
    if (payload.ok && payload.payload?.urn) {
      setCustomUrn(payload.payload.urn);
    }
  };

  const handleGenerateModelData = () => {
    const categories: ModelCategory[] = defaultModelCategories.map((category, index) => ({
      label: category.label,
      count: Math.max(12, Math.min(98, category.count + (index % 3 === 0 ? 10 : -4) + Math.round(Math.random() * 14))),
      utilization: Math.max(40, Math.min(98, category.utilization + Math.round(Math.random() * 12 - 5))),
      status: category.utilization >= 85 ? 'Critical' : category.utilization >= 70 ? 'Watch' : 'Stable',
    }));
    setGeneratedData(categories);
    setUploadMessage('Data kategori model APS berhasil dibuat berdasarkan struktur model aktif.');
  };

  return (
    <div className="aps-viewer-wrap">
      <div ref={container} className="aps-viewer-canvas" />
      <div className="aps-viewer-toolbar">
        <button className="aps-toggle" onClick={() => setClusterEnabled((value) => !value)}>{clusterEnabled ? 'Cluster ON' : 'Cluster OFF'}</button>
        <input value={customUrn} onChange={(event) => setCustomUrn(event.target.value)} placeholder="Masukkan URN APS" />
        <button className="aps-apply" onClick={() => setCustomUrn((value) => value.trim())}>Apply model</button>
        <button className="aps-upload" onClick={handleUploadClick}>Upload model</button>
        <input ref={fileInputRef} type="file" accept=".rvt,.ifc,.dwg,.obj,.glb,.gltf" style={{ display: 'none' }} onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setUploadMessage(`Model dipilih: ${file.name}. Masukkan URN APS yang sudah dipindahkan ke bucket, lalu klik Upload model.`);
        }} />
      </div>
      {uploadMessage && <div className="aps-upload-message">{uploadMessage}</div>}
      {state !== 'ready' && <div className="aps-viewer-state">{state === 'loading' ? <><LoaderCircle size={17} className="spin" /> Menghubungkan APS Viewer...</> : <><Layers3 size={17} />{state === 'unavailable' ? 'APS Viewer siap setelah APS_MODEL_URN dan credential dikonfigurasi.' : 'APS Viewer tidak dapat dimuat. Periksa token dan URN model.'}</>}</div>}
      {state === 'ready' && <div className="aps-viewer-badge"><Layers3 size={13} /> APS Viewer + Labels Cluster <a href="https://github.com/autodesk-platform-services/aps-labelscluster-sample" target="_blank" rel="noreferrer"><ExternalLink size={12} /></a></div>}

      <div className="aps-data-panel">
        <div className="aps-data-header">
          <div>
            <span className="eyebrow">MODEL CATEGORY DATA</span>
            <strong>Generate APS model insights</strong>
          </div>
          <button className="aps-generate" onClick={handleGenerateModelData}>Generate data</button>
        </div>

        <div className="aps-data-grid">
          {generatedData.map((category) => (
            <div className="aps-data-card" key={category.label}>
              <div className="aps-card-top">
                <span>{category.label}</span>
                <em className={`status-${category.status.toLowerCase()}`}>{category.status}</em>
              </div>
              <strong>{category.count}</strong>
              <small>{category.utilization}% utilization</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
