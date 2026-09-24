# Autodesk Platform Services integration

The mobile app reads portfolio data from a backend proxy configured with:

```bash
EXPO_PUBLIC_APS_API_URL=https://your-api.example.com
```

The app calls:

```text
GET /api/aps/facilities
GET /api/aps/models/:urn
GET /api/acc/projects
```

`GET /api/aps/facilities` returns either an array or `{ "projects": [] }` with this shape:

```json
{
  "id": "siloam",
  "name": "RS Siloam",
  "type": "Smart Hospital",
  "status": "Operational",
  "health": 94,
  "issue": "2 anomaly alerts",
  "focus": "HVAC, electrical distribution, elevators",
  "apsProjectId": "bim360-project-id",
  "apsHubId": "bim360-hub-id",
  "modelUrn": "base64-urn",
  "updatedAt": "2026-09-16T09:42:00Z"
}
```

`GET /api/acc/projects` returns the same normalized facility shape and may include ACC/Autodesk Forma fields:

```json
{
  "id": "siloam",
  "accProjectId": "acc-project-id",
  "accProjectName": "RS Siloam Build",
  "accStatus": "In progress",
  "documentCount": 248,
  "openIssueCount": 7,
  "openWorkOrderCount": 18,
  "updatedAt": "2026-09-16T09:42:00Z"
}
```

The backend owns APS OAuth 2.0 credentials and calls the APS Data Management, Model Derivative, Data Visualization/Tandem, and Webhooks APIs. Never ship an APS `client_secret` in the Expo app. The mobile app only receives normalized project data and short-lived, scoped data from the proxy.

Recommended backend flow:

1. Authenticate the backend with APS OAuth 2-legged or Secure Service Account for server integrations.
2. Read hubs, projects, folders, items, and versions with Data Management.
3. Read ACC/Autodesk Forma project documents, issues, forms, assets, and field/work-order data, then expose it through `/api/acc/projects`.
4. Translate model files with Model Derivative and expose the model URN/metadata.
5. Join asset and sensor data from Tandem/Data Visualization or the facility CMMS/IoT platform.
6. Normalize the result into `/api/aps/facilities` and `/api/acc/projects` for the IDTC portfolio cards.
7. Use APS Webhooks to refresh cached project data when files, versions, issues, or field records change.
