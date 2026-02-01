# TicketingApp 🎟️

Microservice-based example application for auctioning tickets to demonstrate microservice boundaries and ownership, practice kubernetes-first local development and show production-style concerns (ingress, secrets, authentication, JWT)

> **Project status:** In active development. Documentation is maintained as the system evolves; some services/components may be added or renamed over the coming weeks.

## What’s implemented so far

This section will be updated throughout development:

### Features

- Authentication using MongoDB for SignUp with basic email-format and password requirements
- Basic authentication tests for automated tests.
- React front-end skeleton to showcase client-side input/output logic

### DevOps

- Kubernetes local dev setup (Docker Desktop Kubernetes)
- Ingress-NGINX routing into the cluster
- JWT secret management via Kubernetes Secrets
- Skaffold workflow for rebuild/redeploy on code changes

## Architecture at a glance

TicketingApp is composed of independently deployed services running in a local Kubernetes cluster that can alternatively be deployed to the cloud.
An NGINX ingress controller acts as the single entry point, routing traffic based on request paths.
The client (Next.js) is served at `/`, while authentication requests under `/api/users/*` are routed to the auth service.
Each service owns its own runtime and dependencies.
Authentication is handled via JWTs signed with a shared secret injected through Kubernetes Secrets.
Skaffold manages the local development loop by rebuilding images and redeploying services on file changes.

### Authentication flow (current)

1. User submits credentials via the client.
2. Client sends request to `POST /api/users/*`.
3. Auth service validates input and issues a JWT.
4. JWT is signed using `JWT_KEY` from Kubernetes Secrets.
5. Token is stored in a cookie and sent with subsequent requests.
6. Services validate JWT signature to trust user identity.

## Local development

### Prerequisites

- Docker Desktop (Kubernetes enabled)
- kubectl
- skaffold

### 1) Install ingress-nginx

1. Run at root:
   `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.14.1/deploy/static/provider/cloud/deploy.yaml`
2. Verify ingress-nginx controller pods are _Running_:
   `kubectl get pods -n ingress-nginx`

### 2) JWT secret

**NOTE:** Not recommended, only do this for testing.

1. Create a local env file at the root:

```
printf "JWT_KEY=ENTER_YOUR_OWN_KEY_VALUE" > .kubectl.env
kubectl create secret generic jwt-secret --from-env-file=.kubectl.env
```

2. Verify _jwt-secret_ exists:
   `kubectl get secret jwt-secret`

### 3) Access the app

1. Map the hostname (example: `ticketing.dev`) by adding `127.0.0.1 ticketing.dev` to:

- macOS/Linux: edit `/etc/hosts`
- Windows: edit `C:\Windows\System32\drivers\etc\hosts`

2. Start the stack with Skaffold
   `skaffold dev --no-prune=false --cache-artifacts=false`

3. Open `https://ticketing.dev/` in your browser.

## Key concepts (why)

- **Ingress-NGINX:** routes `/` → `client-srv:3000` and `/api/users/*` → `auth-srv:3000` (see `infra/k8s/ingress-srv.yaml`).
- **JWT Secret:** shared signing key (`JWT_KEY`) used by services to validate auth tokens.
- **Skaffold:** rebuilds images + redeploys on file changes for tight local dev loop.

## Routes (local)

- `GET /` → `client-srv`
- `/api/users/*` → `auth-srv`
  Host: `ticketing.dev`

## Services (current)

- **client** (Next.js) — UI at `/`
- **auth** (Express + MongoDB) — auth API under `/api/users/*`
- **common** (`@ccgtickets/common`) — shared middleware/types published to npm

## Shared library (@ccgtickets/common)

Published npm package used by services for shared errors/middleware/types.
Version bumps are handled via `npm run pub` in `/common`.
For more detail, look into `/common/package.json` under `"scripts"`.

## Troubleshooting

- Ingress not working: `kubectl get pods -n ingress-nginx` and wait until all are `Running`.
- Host not resolving: confirm `ticketing.dev` entry in hosts file.
- Stale images: restart `skaffold dev` or run `skaffold dev --cache-artifacts=false`.

## Roadmap / planned additions

- [ ] Service list & responsibilities
- [ ] Final Auth flow documentation
- [ ] Complete Architecture diagram
- [ ] CI/CD pipeline notes
- [ ] Observability (logs/metrics/tracing)
