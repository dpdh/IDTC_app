import { findLocalIhsanAnswer } from './ihsanAiData';

export type APSFacilityProject = {
  id: string;
  name: string;
  type: string;
  status: string;
  health: number;
  issue: string;
  focus: string;
  apsProjectId?: string;
  apsHubId?: string;
  modelUrn?: string;
  updatedAt?: string;
  accProjectId?: string;
  accProjectName?: string;
  documentCount?: number;
  openIssueCount?: number;
  openWorkOrderCount?: number;
  accStatus?: string;
};

export type APSModelMetadata = {
  urn: string;
  name: string;
  status: string;
  viewableCount?: number;
};

export type IdtcBootstrap = {
  app: string;
  version: string;
  projects: Array<{
    id: number;
    slug: string;
    name: string;
    facility_type?: string;
    status: string;
    health_score?: number;
    description?: string;
    aps_project_id?: string;
    aps_hub_id?: string;
    model_urn?: string;
    metadata?: Record<string, unknown>;
    updated_at?: string;
  }>;
  contents: Array<{
    id: number;
    project_id?: number;
    slug: string;
    title: string;
    content_type: string;
    status: string;
    excerpt?: string;
    description?: string;
    sort_order: number;
    published_at?: string;
    sections?: Array<{ id: number; heading?: string; body: string; sort_order: number }>;
  }>;
};

const apsApiUrl = (process.env.EXPO_PUBLIC_IDTC_API_URL ?? process.env.EXPO_PUBLIC_APS_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

function getApiUrl(path: string) {
  if (!apsApiUrl) return null;
  return `${apsApiUrl}${path}`;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`APS proxy request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchAPSFacilities(): Promise<APSFacilityProject[]> {
  const url = getApiUrl('/api/aps/facilities');
  if (!url) return [];
  const payload = await getJson<APSFacilityProject[] | { projects?: APSFacilityProject[] }>(url);
  return Array.isArray(payload) ? payload : payload.projects ?? [];
}

export async function fetchAPSModelMetadata(urn: string): Promise<APSModelMetadata | null> {
  const url = getApiUrl(`/api/aps/models/${encodeURIComponent(urn)}`);
  if (!url) return null;
  return getJson<APSModelMetadata>(url);
}

export async function fetchACCProjects(): Promise<APSFacilityProject[]> {
  const url = getApiUrl('/api/acc/projects');
  if (!url) return [];
  const payload = await getJson<APSFacilityProject[] | { projects?: APSFacilityProject[] }>(url);
  return Array.isArray(payload) ? payload : payload.projects ?? [];
}

export async function fetchIdtcBootstrap(): Promise<IdtcBootstrap | null> {
  const url = getApiUrl('/api/idtc/bootstrap');
  if (!url) return null;
  return getJson<IdtcBootstrap>(url);
}

export async function askDinaAi(message: string): Promise<string | null> {
  const url = getApiUrl('/api/dina-ai/chat');
  if (!url) return findLocalIhsanAnswer(message);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error(`DINA AI request failed: ${response.status}`);
    const payload = await response.json() as { answer?: string };
    return payload.answer ?? findLocalIhsanAnswer(message);
  } catch {
    return findLocalIhsanAnswer(message);
  }
}
