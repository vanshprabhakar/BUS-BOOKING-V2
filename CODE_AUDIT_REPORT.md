# Code Audit Report (April 5, 2026)

This report summarizes issues found during a quick static/code-flow review plus a production frontend build.

## What was checked

- Installed dependencies for backend and frontend (`npm ci`).
- Ran backend syntax checks over all `.js` files with `node --check`.
- Ran frontend production build (`npm run build`) to surface ESLint/build warnings.
- Reviewed key backend controllers, routes, models, auth middleware, and core frontend pages/services.

## Issues found

### 1) Frontend ESLint/build warnings (cleanup + reliability)

- `frontend/src/pages/Admin.js`
  - `formatDate` is imported but never used.
  - `isLoading` state is set but not used in rendering.
- `frontend/src/pages/Buses.js`
  - `useEffect` depends on `fetchBuses` but does not list it in dependency array.
- `frontend/src/pages/Payment.js`
  - `useContext` is imported but unused.
- `frontend/src/utils/helpers.js`
  - Email regex has unnecessary escape characters flagged by ESLint.

**Impact**: noisy CI/build output, potential stale closures in hooks, lower maintainability.

---

### 2) Missing authorization guard on schedule creation endpoint

- `POST /api/buses/:id/schedule` is protected by authentication middleware only; no admin-role enforcement at route level.

**Impact**: any authenticated user can mutate schedule records.

**Suggested fix**: add admin middleware to this route (same pattern as `/api/admin/*`) and keep route under admin namespace or clearly enforce role checks.

---

### 3) Booking confirmation can be replayed/idempotency gaps

- `confirmBooking` updates status based on incoming `paymentStatus`, but does not strongly guard against repeated confirms/failures after terminal states.
- Potential seat/accounting inconsistencies if the endpoint is called multiple times with mixed states.

**Impact**: duplicate side effects (seat counters, payment state drift).

**Suggested fix**: enforce a state machine (`payment_pending -> confirmed|failed`, block transitions from terminal states) and return 409 on invalid transitions.

---

### 4) `availableSeats` metric can drift from reality

- Seat truth is schedule-based (`BusSchedule`) but `Bus.availableSeats` is still decremented in booking confirmation and bypass paths.
- Cancellations do not restore `Bus.availableSeats`.

**Impact**: admin/listing metrics diverge from actual date-specific availability.

**Suggested fix**: treat `Bus.availableSeats` as derived/optional, or recalculate from schedules periodically; update cancellation path to release seat state in schedule model.

---

### 5) Refund timing logic uses absolute difference

- Cancellation refund computes `Math.abs(travelDate - currentDate)`.
- Past travel dates can still produce positive deltas and non-zero refund tiers.

**Impact**: incorrect refunds for already-departed trips.

**Suggested fix**: use directional difference (`travelDate - now`), block refunds for past trips, and set policy bands from positive remaining time only.

---

### 6) Input validation depth can be improved for booking payloads

- `createBooking` checks core presence but does not fully validate seat arrays (duplicates, numeric ranges, seat existence in layout).
- Passenger detail alignment with seat count is partly implicit.

**Impact**: malformed payloads can slip in and cause inconsistent booking records.

**Suggested fix**: add strong schema validation (e.g., express-validator/zod), enforce unique seat numbers, and require `passengerDetails.length === seatsBooked.length`.

---

### 7) Auth/session UX/security hardening opportunities

- JWTs are stored in `localStorage` and injected into headers client-side.
- This is common but vulnerable to token theft under XSS.

**Impact**: elevated account takeover risk if frontend XSS occurs.

**Suggested fix**: migrate to HttpOnly secure cookies + CSRF strategy; add refresh-token rotation and explicit server-side token invalidation strategy.

## Prioritized enhancement roadmap

### High priority
1. Enforce admin authorization on schedule mutation routes.
2. Add strict booking/payment state-machine checks and idempotency protections.
3. Correct cancellation refund logic for past/elapsed journeys.
4. Standardize validation for booking creation and admin bus mutations.

### Medium priority
1. Resolve all frontend ESLint warnings and add CI lint gate.
2. Unify seat availability source-of-truth (schedule-first), and reconcile `availableSeats` usage.
3. Add structured audit logs for booking state transitions.

### Nice-to-have
1. Add rate limiting on auth and booking endpoints.
2. Add optimistic locking/version checks on schedule updates.
3. Introduce automated tests for refund policy, double-confirm calls, and seat conflict race conditions.

## Suggested quick wins (1 sprint)

- Add admin middleware to `/:id/schedule` route.
- Fix all current ESLint warnings (low effort, high signal).
- Add defensive checks in `confirmBooking` for terminal statuses.
- Patch refund calculation to disallow refunds after departure.
- Add payload validation middleware for booking create.
