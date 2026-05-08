---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section { font-size: 30px; }
  section.lead h1 { font-size: 58px; }
  section.compact { font-size: 25px; }
  table { font-size: 22px; }
  .muted { color: #666; }
  .callout {
    border-left: 7px solid #2563eb;
    padding: 14px 20px;
    background: #eff6ff;
  }
---

<!-- _class: lead -->

# TicketingApp

## Node/TypeScript microservices on AWS k3s

<span class="muted">3-minute presentation + short live demo</span>

<!--
Timing: 10s.
Say: "This is my TicketingApp: a small ticket marketplace built as microservices. The point of the project is not only the app UI, but proving that the same Kubernetes-style deployment can run locally and in AWS."
-->

---

# What the app does

```text
Browser
  ↓
ingress-nginx
  ├─ /              → client service
  ├─ /api/users     → auth service → auth MongoDB
  └─ /api/tickets   → tickets service → tickets MongoDB
                                      → NATS Streaming events
```

<div class="callout">
A Next.js frontend talks to independent backend services through one Kubernetes ingress.
</div>

<!--
Timing: 20s.
Say: "The frontend, auth API, and tickets API are separate deployable services. Ingress routes browser traffic to the right service. Each service owns its data store, and ticket changes publish events through NATS Streaming."
-->

---

# Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16, React 19, Bootstrap 5, Axios |
| Backend APIs | Node.js 22, TypeScript 5, Express 4 |
| Auth/session | JWT + cookie-session |
| Data | MongoDB pods, Mongoose 9 |
| Events | NATS Streaming + node-nats-streaming |
| Platform | Docker, Kubernetes manifests, ingress-nginx, Skaffold |
| Cloud/IaC | Terraform, AWS EC2 + k3s |

<!--
Timing: 30s.
Say: "The common theme is TypeScript end to end. The shared @ccgtickets/common package keeps errors, middleware, validation and event types consistent across services. Locally I use Docker Desktop Kubernetes and Skaffold; on AWS the same shape runs in k3s."
-->

---

# AWS services used — and why

| AWS service | Why it is used |
|---|---|
| EC2 `t3.medium` | Single affordable VM running k3s and all pods |
| EBS root disk | Storage for the EC2 host |
| VPC + public subnets | Isolated demo network with public access |
| Internet Gateway + route table | Lets the browser reach port 80 on the instance |
| Public IPv4 / DNS | Simple demo URL: `http://EC2_PUBLIC_IP` |
| Security Group | Opens `80`; restricts SSH `22` and k8s API `6443` to my IP |
| IAM role/profile | SSM access and AWS-managed instance permissions |
| EC2 Key Pair | SSH fallback/debug access |

<!--
Timing: 35s.
Say: "The AWS design is intentionally small. Terraform creates the network, access rules, IAM profile and EC2 instance. k3s is installed by user data, then a bootstrap script deploys ingress-nginx and the app manifests. The goal is to demonstrate cloud deployment without adding managed services before they are needed."
-->

---

# Why EC2 + k3s, not EKS yet?

| Option | Approx. baseline cost | Fit for this stage |
|---|---:|---|
| Current EC2 + k3s | ~$35–$45/month | Good portfolio/demo target |
| Minimal EKS | ~$110–$125/month before LB | More expensive baseline |
| EKS + ALB/NAT/etc. | ~$130–$200+/month | Better later for production shape |

**Deferred for now:** EKS, ALB/NLB, NAT Gateway, RDS/DocumentDB, ECR, Route 53, ACM.

<div class="callout">
k3s keeps real Kubernetes concepts while avoiding the EKS control-plane cost.
</div>

<!--
Timing: 25s.
Say: "EKS is the right direction once I need managed control planes, multi-AZ nodes, AWS load balancer integration, IRSA and team operations. For a demo, k3s proves the deployment path at much lower cost. The tradeoff is that this is not highly available and not production-ready."
-->

---

# Live demo: 45 seconds

```bash
export KUBECONFIG=$PWD/infra/aws/terraform/k3s.yaml
PUBLIC_IP=$(terraform -chdir=infra/aws/terraform output -raw public_ip)

kubectl get pods,svc,ingress -n ticketing
curl -i http://$PUBLIC_IP/api/users/currentuser
```

Then open:

```text
http://EC2_PUBLIC_IP
```

Demo path: landing page → sign up/sign in → create or view ticket.

<!--
Timing: 45s.
Say: "First I show the Kubernetes resources are running. Then I hit the current-user API to prove ingress reaches the auth service. Finally I open the frontend, sign in, and show the app working through the public EC2 IP."
-->

---

# Summary

- TypeScript microservices: `client`, `auth`, `tickets`, shared contracts.
- Kubernetes deployment: ingress-nginx, services, deployments, MongoDB, NATS.
- AWS footprint: Terraform-managed EC2 + k3s in a small public VPC.
- Reasoning: cheap cloud demo now; EKS and managed services later.

**Next improvements:** HTTPS/domain, persistent database, immutable image tags, CI/CD.

<!--
Timing: 15s.
Say: "In short: this repo shows the path from local Kubernetes development to a real AWS-hosted Kubernetes demo, while keeping the architecture and the cost appropriate for the current stage."
-->
