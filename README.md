# TicketingApp

Microservices portfolio project for ticketing workflows, built with Node.js, TypeScript, Next.js, MongoDB, Kubernetes, and Skaffold.

## What this repo demonstrates

- Service boundaries (`auth`, `tickets`, `client`) behind Kubernetes ingress.
- Shared backend contracts and middleware via published package `@ccgtickets/common`.
- Local cloud-style development loop with `skaffold dev` and live image rebuilds.

## Architecture

- `client` (Next.js): UI, auth forms, session-aware header.
- `auth` (Express + MongoDB): signup, signin, signout, current user.
- `tickets` (Express + MongoDB): create ticket, fetch ticket by id.
- `common` (Git submodule): shared errors, auth middleware, validation middleware.
- `infra/k8s`: deployments/services for all components plus ingress routing.

Ingress routes:

- `/` -> `client-srv:3000`
- `/api/users/*` -> `auth-srv:3000`

## Codebase overview

- [client](/ticketingApp/client): Next.js pages and UI components.
- [auth](/ticketingApp/auth): identity service (`/api/users/*`).
- [tickets](/ticketingApp/tickets): ticket service (`/api/tickets*`).
- [common](/ticketingApp/common): shared package source (`@ccgtickets/common`).
- [infra/k8s](/ticketingApp/infra/k8s): Kubernetes manifests.
- [skaffold.yaml](/ticketingApp/skaffold.yaml): local build/deploy pipeline.
- [scripts/install-all.mjs](/ticketingApp/scripts/install-all.mjs): root dependency installer.

## API surface (current)

Auth service:

- `POST /api/users/signup`
- `POST /api/users/signin`
- `POST /api/users/signout`
- `GET /api/users/currentuser`

Tickets service:

- `POST /api/tickets` (requires auth)
- `GET /api/tickets/:id`

## Setup (WSL-first, executable)

### Prerequisites

- Node.js 20+ and npm
- Docker Desktop with Kubernetes enabled
- `kubectl`
- `skaffold`
- Git access to `CGraczyk/ticketingApp`
- Git access to `CGraczyk/ccgtickets-common` (submodule)

### 1. Clone

```bash
git clone git@github.com:CGraczyk/ticketingApp.git
cd ticketingApp
```

If you want the shared package common source:

```bash
git submodule update --init --recursive common
```

### 2. Install everything from root

Run once at repository root:

```bash
npm install
```

Root `postinstall` installs dependencies for `client`, `auth`, `tickets`, and `common` (when `common/package.json` is present).

### 3. Install ingress controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.14.1/deploy/static/provider/cloud/deploy.yaml
kubectl get pods -n ingress-nginx
```

Continue only after ingress controller pods are `Running`.

### 4. Create JWT secret

Bash:

```bash
echo "JWT_KEY=replace_with_a_long_random_value" > .kubectl.env
kubectl create secret generic jwt-secret --from-env-file=.kubectl.env
kubectl get secret jwt-secret
```

If secret already exists:

```bash
kubectl delete secret jwt-secret
kubectl create secret generic jwt-secret --from-env-file=.kubectl.env
```

### 5. Add local hostname mapping

Add this line:

```text
127.0.0.1 ticketing.dev
```

- Windows hosts file: `C:\Windows\System32\drivers\etc\hosts`
- Linux/macOS/WSL hosts file: `/etc/hosts`

If you browse from Windows, update Windows hosts file.

### 6. Start the full stack

```bash
skaffold dev --no-prune=false --cache-artifacts=false
```

Open `http://ticketing.dev`.

### 7. Quick verification

- Home page loads.
- Create account at `/auth/signup`.
- Sign in/out works.
- `GET /api/users/currentuser` returns current user when authenticated.

## Development commands

- Root dependency sync: `npm install`
- Refresh `@ccgtickets/common` in services: `npm run bump`
- Auth tests: `cd auth && npm test`
- Tickets tests: `cd tickets && npm test`

## Shared package flow

- `auth` and `tickets` consume published `@ccgtickets/common`.
- Submodule source is in [common](/ticketingApp/common).
- Publish from `common` with `npm run pub`, then from root run `npm run bump`.

## Troubleshooting

- Service crashes at boot: confirm `jwt-secret` exists and Mongo pods are running.
- `ticketing.dev` not resolving: fix hosts entry and flush DNS if needed.
- Ingress not routing: verify ingress-nginx pods are `Running` in namespace `ingress-nginx`.
