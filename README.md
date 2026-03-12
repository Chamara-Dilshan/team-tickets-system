# Teams Ticket System
### Angular + Microsoft Power Automate + Microsoft Teams Integration Demo

---

## System Architecture

```
┌─────────────────┐     HTTP POST      ┌──────────────────────┐     Teams API     ┌──────────────────┐
│   Angular UI    │ ─────────────────► │  Power Automate Flow │ ────────────────► │  Teams Channel   │
│  (localhost)    │   JSON payload     │  (HTTP Trigger)      │  formatted card   │  (Notification)  │
└─────────────────┘                    └──────────────────────┘                   └──────────────────┘
```

**How it works:**
1. User fills the "Create Ticket" form in Angular
2. Angular sends an HTTP POST with JSON to the Power Automate trigger URL
3. Power Automate receives the request and formats a Teams message
4. Teams channel receives a rich notification with ticket details
5. Angular shows a success message and adds the ticket to the local list

---

## Project Structure

```
teams-ticket-system/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/           ← Main page layout with architecture banner
│   │   │   ├── ticket-form/         ← Reactive form for ticket creation
│   │   │   └── ticket-list/         ← Live list of submitted tickets
│   │   ├── models/
│   │   │   └── ticket.model.ts      ← Ticket TypeScript interface
│   │   ├── services/
│   │   │   └── ticket.service.ts    ← HTTP calls + BehaviorSubject state
│   │   ├── app.module.ts
│   │   ├── app-routing.module.ts
│   │   └── app.component.*
│   ├── environments/
│   │   ├── environment.ts           ← ⚠️  Add your Power Automate URL here
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Step 1: Install Dependencies

```bash
# Requires Node.js 18+ and Angular CLI 17+
npm install -g @angular/cli

# Install project dependencies
npm install
```

---

## Step 2: Create the Power Automate Flow

### 2.1 — Create the Flow
1. Go to **[make.powerautomate.com](https://make.powerautomate.com)**
2. Click **+ Create** → **Instant cloud flow**
3. Choose trigger: **"When an HTTP request is received"**
4. Name the flow: `Teams Ticket Notification`
5. Click **Create**

### 2.2 — Configure the HTTP Trigger
In the trigger step, click **"Use sample payload to generate schema"** and paste:

```json
{
  "title": "Login page broken",
  "description": "Users cannot log in after the latest deployment.",
  "priority": "High",
  "createdBy": "Jane Smith",
  "id": "TKT-ABC123",
  "status": "Open"
}
```

Set **Method** to `POST`.

### 2.3 — Add a Teams Action
Click **+ New step** and search for **Microsoft Teams**.

Select: **Post a message in a chat or channel**

Configure:
| Field      | Value                          |
|------------|--------------------------------|
| Post as    | Flow bot                       |
| Post in    | Channel                        |
| Team       | *(select your team)*           |
| Channel    | *(select your channel)*        |
| Message    | *(see below)*                  |

**Message body** (use the Expression editor for dynamic content):
```
🎫 NEW SUPPORT TICKET

**ID:** @{triggerBody()?['id']}
**Title:** @{triggerBody()?['title']}
**Description:** @{triggerBody()?['description']}
**Priority:** @{triggerBody()?['priority']}
**Created By:** @{triggerBody()?['createdBy']}
**Status:** @{triggerBody()?['status']}
```

### 2.4 — Save and Copy the Trigger URL
1. Click **Save**
2. Open the trigger step — copy the **HTTP POST URL** (it looks like `https://prod-xx.westus.logic.azure.com/...`)

---

## Step 3: Connect Angular to Power Automate

Open `src/environments/environment.ts` and paste your URL:

```typescript
export const environment = {
  production: false,
  powerAutomateUrl: 'https://prod-xx.westus.logic.azure.com/workflows/...'
};
```

---

## Step 4: Run the Application

```bash
ng serve
```

Open your browser at **[http://localhost:4200](http://localhost:4200)**

---

## CORS Note

Power Automate HTTP triggers may not include CORS headers, which can cause browser errors for direct calls from `localhost`. The Angular service already handles HTTP 202 responses gracefully.

For a CORS-free local setup, create `proxy.conf.json` in the project root:

```json
{
  "/pa-trigger": {
    "target": "https://prod-xx.westus.logic.azure.com",
    "secure": true,
    "changeOrigin": true,
    "pathRewrite": { "^/pa-trigger": "" }
  }
}
```

Then update `environment.ts` to use `/pa-trigger/workflows/...` and serve with:
```bash
ng serve --proxy-config proxy.conf.json
```

---

## Ticket Data Model

```typescript
interface Ticket {
  title:       string;              // e.g. "Login page not loading"
  description: string;              // Detailed description
  priority:    'Low' | 'Medium' | 'High';
  createdBy:   string;              // Submitter's name
  id?:         string;              // Auto-generated: TKT-XXXXXX
  createdAt?:  Date;                // Auto-set on submit
  status?:     'Open' | 'In Progress' | 'Closed';  // Defaults to 'Open'
}
```

---

## Example Teams Channel Message

```
🎫 NEW SUPPORT TICKET

ID:          TKT-ABC123
Title:       Login page not loading after deployment
Description: Users are unable to access the login page. The error occurs
             on both mobile and desktop browsers after today's release.
Priority:    High
Created By:  Jane Smith
Status:      Open
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/models/ticket.model.ts` | TypeScript interface for Ticket |
| `src/app/services/ticket.service.ts` | HTTP POST to Power Automate + RxJS state |
| `src/app/components/ticket-form/*` | Reactive form with validation |
| `src/app/components/ticket-list/*` | Live-updating list via BehaviorSubject |
| `src/app/components/dashboard/*` | Layout with architecture flow banner |
| `src/environments/environment.ts` | Power Automate URL config |
