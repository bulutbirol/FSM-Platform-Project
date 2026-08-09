# ServiceFlow Code Simplification Design

## Goal

Make the recently expanded workflow easier to read and maintain without changing routes, API payloads, authorization, status transitions, or visible behavior.

## Scope

- Format dense React pages into conventional multi-line JSX.
- Extract role-specific request and work-order controls into focused components.
- Centralize browser-local date-time input formatting and appointment readiness logic.
- Replace repeated locked repository lookups in backend services with clearly named private helpers.
- Preserve the existing folder structure except for small domain component and utility folders.

## Boundaries

- No visual redesign.
- No database migration or API contract change.
- No status-machine or permission change.
- No dependency addition.
- Existing unrelated working-tree changes remain untouched.

## Proposed Structure

```text
frontend/src/
  components/
    requests/
      RequestAdminPanel.jsx
      TechnicianAcceptancePanel.jsx
    work-orders/
      TechnicianWorkOrderAction.jsx
      WorkOrderSidePanel.jsx
  utils/
    dateTime.js
  pages/
    RequestDetailPage.jsx
    WorkOrderDetailPage.jsx
```

Page components remain responsible for data fetching and mutations. Extracted components receive plain data and callbacks, making their purpose clear without introducing another state-management layer.

Backend services keep their current public methods. Private `find...ForUpdate` helpers own resource-not-found behavior and make transaction boundaries easier to scan.

## Verification

- Run all backend tests.
- Run all frontend tests.
- Run the frontend production build.
- Run `git diff --check`.
- Confirm no API path, payload field, permission, or workflow status changed.
