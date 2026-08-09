# Customer Request Approval Workflow Design

## Goal

Change ServiceFlow from an admin-created intake flow to a customer-originated
approval flow:

1. A customer submits a service request.
2. An administrator reviews and approves it.
3. Approved requests appear in the technician intake queue.
4. A technician accepts a request and confirms an appointment date and time.
5. The accepted request becomes the technician's scheduled work order.
6. At the appointment, the technician starts and completes the work.

## Status model

The existing statuses remain the source of truth:

- `NEW`: submitted by a customer and waiting for administrator review.
- `REVIEWED`: approved by an administrator and waiting for a technician.
- `SCHEDULED`: accepted by a technician with a confirmed appointment.
- `IN_PROGRESS`: the technician started the appointment.
- `COMPLETED`: the technician completed the work.
- `CANCELLED`: rejected or cancelled by an administrator.

The existing quotation states remain available as an optional commercial flow,
but they are not required for this direct approval path.

## Authorization and ownership

- Customers may create requests only for the customer record linked to their
  authenticated account.
- The backend derives customer ownership from the JWT identity; a customer
  cannot select or impersonate another customer.
- Administrators may continue to create requests for any active customer.
- Administrators can move `NEW` requests to `REVIEWED` or `CANCELLED`.
- Technicians can list and open only requests in `REVIEWED` state.
- A technician accepting a request becomes its assigned technician.
- Existing work-order authorization continues to prevent technicians from
  updating work assigned to someone else.

## Backend flow

`POST /api/service-requests` accepts both Admin and Customer roles. For a
Customer, the service ignores any supplied customer identifier and uses the
authenticated user's linked active customer. For an Admin, `customerId` remains
required.

`GET /api/service-requests` accepts the Technician role. Technicians receive the
shared `REVIEWED` intake queue; customers receive only their own requests; Admins
receive all requests.

`POST /api/work-orders/accept-request/{requestId}` accepts a required future or
present appointment date/time. In one transaction it verifies that the request
is `REVIEWED`, verifies that no work order already exists, creates a `SCHEDULED`
work order assigned to the authenticated technician, and changes the request to
`SCHEDULED`.

## Frontend flow

- Customers see a **New request** action.
- The customer request form omits the customer selector and explains that the
  request is linked to the signed-in customer account.
- Admin request detail presents explicit **Approve for technicians** and
  **Reject request** actions for `NEW` requests.
- Technicians receive a **Request queue** navigation item showing approved
  requests.
- Technician request detail contains an appointment date/time control and an
  **Accept and schedule** action.
- After acceptance, the technician is taken to the new work order and waits for
  the appointment before selecting **Start work**.

## Failure handling

- An unlinked or inactive customer account receives a clear forbidden error.
- Admin creation without a customer receives a clear business-rule error.
- A technician cannot accept a request that is not `REVIEWED`.
- A request cannot be accepted twice.
- Appointment validation rejects dates in the past.

## Verification

Backend tests cover customer ownership, technician queue filtering, successful
acceptance, invalid status, and duplicate acceptance. Frontend tests cover role
navigation and the customer-visible request action. The full backend test suite,
frontend test suite, and production frontend build must pass.
