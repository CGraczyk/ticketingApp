---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-size: 29px;
  }
  section.lead h1 {
    font-size: 56px;
  }
  section.small {
    font-size: 23px;
  }
  section.compact {
    font-size: 25px;
  }
  .muted {
    color: #666;
  }
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 34px;
    align-items: start;
  }
  .placeholder {
    border: 3px dashed #aaa;
    border-radius: 14px;
    padding: 34px;
    text-align: center;
    color: #555;
    background: #fafafa;
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .callout {
    border-left: 7px solid #2563eb;
    padding: 16px 22px;
    background: #eff6ff;
  }
  .warn {
    border-left: 7px solid #f59e0b;
    padding: 16px 22px;
    background: #fffbeb;
  }
  table {
    font-size: 22px;
  }
---

<!--
Marp-compatible Markdown deck.
Add screenshots by replacing a placeholder with Markdown image syntax, for example:
![w:1000](../images/aws-ec2-running.png)

Export examples:
  npx @marp-team/marp-cli docs/ticketing-app-aws-k3s-presentation.marp.md --pptx
  npx @marp-team/marp-cli docs/ticketing-app-aws-k3s-presentation.marp.md --pdf
  npx @marp-team/marp-cli docs/ticketing-app-aws-k3s-presentation.marp.md --html

WSL/PPTX export note:
  If WSL cannot find a Windows Firefox install, use the Docker workflow documented in:
  docs/marp-export-from-wsl.md
-->

<!-- _class: lead -->

# TicketingApp

## Microservices on Kubernetes: tech stack, AWS services, and EKS vs k3s cost

<span class="muted">Repo scan summary + presentation deck</span>

---

# Agenda

1. What the app does
2. Tech stack and service boundaries
3. Kubernetes deployment model
4. AWS infrastructure and services used
5. Cost comparison: current EC2+k3s vs EKS
6. Demo flow and screenshot placeholders

---

# Repo scan: current shape

| Area | Path | Purpose |
|---|---|---|
| Frontend | `client/` | Next.js UI, auth pages, session-aware header |
| Auth API | `auth/` | Signup, signin, signout, current user |
| Tickets API | `tickets/` | Create, list, show, update tickets; publishes events |
| Shared contracts | `common/` + `@ccgtickets/common` | Shared errors, auth middleware, validation, event types |
| Local Kubernetes | `infra/k8s/` | Docker Desktop manifests |
| AWS deployment | `infra/aws/` | Terraform + k3s mirror manifests + bootstrap script |
| Dev pipeline | `skaffold.yaml` | Local build/deploy loop |

---

# Product architecture

```text
Browser
  |
  v
ingress-nginx
  |-- /              -> client-srv   -> Next.js UI
  |-- /api/users     -> auth-srv     -> auth MongoDB
  |-- /api/tickets   -> tickets-srv  -> tickets MongoDB
                                      -> NATS Streaming events
```

<div class="callout">
The repo demonstrates microservice boundaries behind a Kubernetes ingress, with shared TypeScript contracts through a published common package.
</div>

---

# Service boundaries

| Service | Runtime | Responsibilities |
|---|---|---|
| `client` | Next.js / React | UI, auth forms, server-side request forwarding |
| `auth` | Express / TypeScript | User registration, login, logout, JWT cookie sessions |
| `tickets` | Express / TypeScript | Ticket CRUD, owner authorization, event publishing |
| `auth-mongo` | MongoDB pod | User persistence |
| `tickets-mongo` | MongoDB pod | Ticket persistence |
| `nats` | NATS Streaming pod | Demo event bus for ticket events |

---

# API surface

## Auth service

- `POST /api/users/signup`
- `POST /api/users/signin`
- `POST /api/users/signout`
- `GET /api/users/currentuser`

## Tickets service

- `GET /api/tickets`
- `POST /api/tickets` — requires auth
- `GET /api/tickets/:id`
- `PUT /api/tickets/:id` — requires owner auth

---

# Application tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, Bootstrap 5, Axios |
| Backend | Node.js 22, TypeScript 5, Express 4 |
| API middleware | `express-validator`, `express-async-errors`, shared `@ccgtickets/common` |
| Auth/session | JWT + `cookie-session`; secure cookies locally/HTTPS, `COOKIE_SECURE=false` for AWS HTTP demo |
| Persistence | Mongoose 9 + MongoDB pods |
| Events | NATS Streaming `0.17.0`, `node-nats-streaming` |
| Tests | Jest, ts-jest, Supertest, mongodb-memory-server |

---

# Container and developer workflow

<div class="columns">
<div>

## Local

- Docker Desktop Kubernetes
- `skaffold dev`
- Images built locally, not pushed
- Hostname: `ticketing.dev`
- Ingress controller installed separately

</div>
<div>

## AWS demo

- Build images locally
- Push to Docker Hub:
  - `chriscrossington/auth:latest`
  - `chriscrossington/tickets:latest`
  - `chriscrossington/client:latest`
- k3s pulls public images

</div>
</div>

---

# Kubernetes runtime model

| Concern | Local Docker Desktop | AWS k3s mirror |
|---|---|---|
| Manifests | `infra/k8s/` | `infra/aws/k3s-mirror/` |
| Namespace | `default` | `ticketing` |
| Images | Local Skaffold images | Docker Hub `:latest` |
| Public URL | `http://ticketing.dev` | `http://EC2_PUBLIC_IP` |
| Ingress host | `ticketing.dev` | No host rule; IP-based demo |
| Auth cookie | Secure unless test | `COOKIE_SECURE=false` for HTTP |

---

# Kubernetes objects in use

- Deployments: `client`, `auth`, `tickets`, `auth-mongo`, `tickets-mongo`, `nats`
- Services: one ClusterIP service per app/data/event deployment
- Ingress: `ingress-service` with `ingressClassName: nginx`
- Secret: `jwt-secret`, created from local `.kubectl.env`
- AWS namespace: `ticketing`
- ingress-nginx controller installed into `ingress-nginx` namespace

<div class="warn">
Current data stores are demo pods without persistent volumes. Data is ephemeral.
</div>

---

# Screenshot / live demo slot: app

<div class="placeholder">
<strong>Add screenshot:</strong>
Frontend at <code>http://EC2_PUBLIC_IP</code><br />
Suggested flow: landing page → sign up → signed-in header → create ticket API call
</div>

---

# AWS services used today

| AWS service | Current use |
|---|---|
| EC2 | Single `t3.medium` Amazon Linux 2023 instance running k3s |
| EBS | Root disk for the EC2 instance |
| Public IPv4 / DNS | Direct demo access to port 80 and kube API access from laptop |
| VPC | Dedicated `10.0.0.0/24` network |
| Public subnets | Two subnets; EC2 currently placed in subnet A |
| Internet Gateway + route table | Public inbound/outbound internet path |
| Security Group | `80` public; `22` and `6443` restricted to home IP |
| IAM role/profile | SSM Managed Instance Core + ECR read-only policy |
| EC2 Key Pair | SSH access using local public key |

---

# Services intentionally not used yet

| Not used | Why deferred |
|---|---|
| EKS | Higher baseline cost and operational surface for this demo stage |
| ALB/NLB | Current ingress is direct through EC2 public IP |
| NAT Gateway | No private-node architecture yet; avoids hourly NAT cost |
| RDS / DocumentDB | MongoDB runs in-cluster for demo simplicity |
| ECR repositories | Docker Hub is used for first remote image flow |
| Route 53 + ACM | No domain/HTTPS yet |
| Secrets Manager / SSM Parameter Store | JWT secret is currently a Kubernetes Secret from `.kubectl.env` |

---

# Terraform and k3s bootstrapping

```text
terraform apply
  -> VPC, subnets, IGW, routes, SG, IAM, key pair, EC2
  -> EC2 user data installs k3s
     - disables Traefik
     - adds EC2 public IP as TLS SAN

k3s-bootstrap.sh
  -> fetches kubeconfig from EC2
  -> installs ingress-nginx
  -> creates namespace + jwt-secret
  -> applies infra/aws/k3s-mirror/
```

<div class="callout">
Terraform owns AWS infrastructure; Kubernetes manifests are applied after k3s is reachable.
</div>

---

# Screenshot / live demo slot: infrastructure

<div class="placeholder">
<strong>Add screenshot:</strong>
Terraform output, AWS EC2 running instance, or <code>kubectl get pods -n ticketing</code><br />
Suggested command: <code>kubectl get pods,svc,ingress -n ticketing</code>
</div>

---

# Current constraints to call out

- Single EC2 node: no high availability
- HTTP only: AWS manifests set `COOKIE_SECURE=false`
- No domain, TLS, Route 53, or ACM yet
- MongoDB and NATS are in-cluster demo pods
- MongoDB has no persistent volumes in current version
- Docker images use `latest`, which is convenient but not reproducible
- Security group uses a fixed home-IP allowlist for SSH and Kubernetes API
- NATS Streaming is included for learning; a production event bus would likely be revisited

---

# Current EC2+k3s cost estimate

Assumption: region `eu-central-1`, running 24/7, approximately 730 hours/month.

| Cost driver | Estimate |
|---|---:|
| EC2 `t3.medium` | ~$0.045–$0.05/hour |
| Public IPv4 address | ~$0.005/hour |
| EBS root volume | Small storage cost |
| VPC, subnets, route table, SG, IGW, IAM, key pair | Free / near-free |

## Approximate total

```text
~$0.05–$0.06/hour
~$1.20–$1.50/day
~$35–$45/month if left running 24/7
```

---

# EKS cost vs current k3s setup

| Scenario | Main cost components | Approx. monthly baseline |
|---|---|---:|
| Current EC2+k3s demo | 1× `t3.medium`, public IPv4, EBS | ~$35–$45 |
| Minimal EKS parity | EKS control plane + 1× worker node + EBS/IPv4 | ~$110–$125 before load balancer |
| EKS with AWS-native ingress | Minimal EKS + ALB/NLB | ~$130–$150+ |
| More production-shaped EKS | 2+ nodes, private subnets, NAT Gateway(s), ALB/NLB, logs | Often ~$200+/month |

<div class="warn">
EKS adds a managed control-plane charge of about <strong>$0.10/hour</strong> — roughly <strong>$73/month</strong> — before worker nodes, load balancers, NAT, storage, or traffic.
</div>

---

# Why k3s is the right current stage

<div class="columns">
<div>

## Good fit now

- Demonstrates real Kubernetes objects
- Keeps ingress-nginx behavior close to local dev
- Avoids EKS control-plane cost
- Simple Terraform footprint
- Easy to tear down and recreate

</div>
<div>

## Tradeoffs

- Self-managed cluster lifecycle
- Single-node failure domain
- Less AWS-native integration
- No managed Kubernetes upgrades
- Not the final production architecture

</div>
</div>

---

# When EKS becomes worth it

Move toward EKS when the project needs:

- Multi-node and multi-AZ production availability
- Managed Kubernetes control plane and upgrade path
- IAM Roles for Service Accounts, AWS Load Balancer Controller, cluster autoscaling
- Private networking, centralized logging/monitoring, policy controls
- Team/shared environments where operational consistency is worth the baseline cost

<div class="callout">
For a portfolio/demo environment, k3s proves the cloud deployment path at roughly one-third or less of a minimal EKS baseline.
</div>

---

# Suggested demo script

1. Show repo structure: `client/`, `auth/`, `tickets/`, `infra/`
2. Show local manifest parity vs AWS mirror
3. Show Terraform resources in `infra/aws/terraform/`
4. Run or show: `terraform output public_ip`
5. Run: `kubectl get pods,svc,ingress -n ticketing`
6. Open `http://EC2_PUBLIC_IP`
7. Sign up / sign in
8. Call `GET /api/users/currentuser`
9. Summarize cost: k3s now, EKS later

---

# Screenshot checklist

<div class="columns">
<div>

## Recommended screenshots

- App landing page
- Signup/signin success
- `kubectl get pods -n ticketing`
- `kubectl get ingress -n ticketing`
- AWS EC2 instance details
- Terraform outputs

</div>
<div>

## Optional screenshots

- Docker Hub image tags
- AWS VPC/subnets view
- Security group inbound rules
- k3s node details
- Ingress-nginx controller pods
- Mermaid diagrams from `infra/*.md`

</div>
</div>

---

# Near-term improvements

- Replace Docker `latest` tags with immutable image tags
- Add health endpoints and readiness/liveness probes
- Add persistence or move MongoDB to Atlas / managed database
- Add HTTPS through domain + cert-manager or ALB + ACM
- Consider ECR for image storage
- Add CI/CD for build, test, image push, and deploy
- Revisit EKS when managed Kubernetes benefits justify the baseline cost

---

<!-- _class: lead -->

# Summary

- The app is a TypeScript/Node microservices system with a Next.js frontend.
- Kubernetes manifests are mirrored from local Docker Desktop to AWS k3s.
- AWS currently uses a lean EC2+k3s deployment, not EKS.
- The main EKS blocker is baseline cost: managed control plane + workers + load balancer/NAT.
- k3s is the right demo step; EKS is a later production-shaped upgrade.
