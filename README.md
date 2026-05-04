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
- `infra/k8s`: local Docker Desktop Kubernetes manifests.
- `infra/aws`: AWS EC2 + k3s deployment mirror and Terraform infrastructure.

Ingress routes:

- `/` -> `client-srv:3000`
- `/api/users/*` -> `auth-srv:3000`
- `/api/tickets/*` -> `tickets-srv:3000`

## Codebase overview

- [client](/ticketingApp/client): Next.js pages and UI components.
- [auth](/ticketingApp/auth): identity service (`/api/users/*`).
- [tickets](/ticketingApp/tickets): ticket service (`/api/tickets*`).
- [common](/ticketingApp/common): shared package source (`@ccgtickets/common`).
- [infra/k8s](/ticketingApp/infra/k8s): local Kubernetes manifests.
- [infra/aws](/ticketingApp/infra/aws): AWS/k3s deployment files.
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

## Docker Hub image publishing

For the first AWS/k3s demo, publish public Docker Hub images with the `latest` tag:

```bash
docker login

docker build -t chriscrossington/auth:latest -f auth/dockerfile auth
docker push chriscrossington/auth:latest

docker build -t chriscrossington/tickets:latest -f tickets/dockerfile tickets
docker push chriscrossington/tickets:latest

docker build -t chriscrossington/client:latest -f client/dockerfile client
docker push chriscrossington/client:latest
```

Remote Kubernetes manifests can then use:

```text
chriscrossington/auth:latest
chriscrossington/tickets:latest
chriscrossington/client:latest
```

Note: `latest` is convenient for demos but less reproducible than immutable tags.

## AWS/k3s demo deployment

AWS deployment docs live in [`infra/aws/README.md`](./infra/aws/README.md).

Current cloud demo:

- Terraform creates EC2 + k3s in `eu-central-1`.
- Docker Hub stores app images.
- `infra/aws/scripts/k3s-bootstrap.sh` installs ingress-nginx and applies `infra/aws/k3s-mirror/`.
- App runs at `http://EC2_PUBLIC_IP`.
- AWS manifests set `COOKIE_SECURE=false` because the demo uses HTTP, not HTTPS.

## Shared package flow

- `auth` and `tickets` consume published `@ccgtickets/common`.
- Submodule source is in [common](/ticketingApp/common).
- Publish from `common` with `npm run pub`, then from root run `npm run bump`.

## Troubleshooting

- Service crashes at boot: confirm `jwt-secret` exists and Mongo pods are running.
- `ticketing.dev` not resolving: fix hosts entry and flush DNS if needed.
- Ingress not routing: verify ingress-nginx pods are `Running` in namespace `ingress-nginx`.



## NATS Streaming Server
just to learn, should be kafka instead for prod.

Subscription based - services subscribe to NATS Streaming Channel.
Publish event to "ticket:updated" channel, sent to services listening to "ticket:updated" channel.

Old storage paradigm: Store all events, so downtime can be recovered from the storage, same for new services.

NATS paradigm: Similar but better: Stored as flat files or Database (Postgres DB / MySQL) as well as memory.

### listener class
data type depending on channel selection.
putting the event bus implement nats into common is super necessary to avoid typos while coding etc (the whole work is so that typescript catches code errors early and unifies data contracts.)
Crosslanguage support with JSON SChema, Protobuf or Apache Avro.
