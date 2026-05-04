# AWS k3s Deployment

AWS demo deployment for the local Docker Desktop Kubernetes app.

## Structure

```text
infra/aws/terraform/   AWS infrastructure: VPC, EC2, k3s
infra/aws/k3s-mirror/  Kubernetes manifests for remote k3s
infra/aws/scripts/     Helper scripts
```

Local manifests stay in `infra/k8s/`. The AWS mirror changes only what must differ remotely:

- images use Docker Hub `:latest`
- ingress has no `ticketing.dev` host
- app runs in namespace `ticketing`
- `COOKIE_SECURE=false` is set for HTTP-only demo auth

## Prerequisites

- AWS CLI authenticated to the target account
- Terraform
- Docker logged in to Docker Hub
- kubectl
- `.kubectl.env` at repo root with `JWT_KEY=...`
- AWS budget alert configured before running paid resources

## Flow

```text
Terraform creates EC2 + k3s
Docker pushes images to Docker Hub
bootstrap script installs ingress-nginx and applies manifests
Browser opens http://EC2_PUBLIC_IP
```

## 1. Deploy infrastructure

```bash
cd infra/aws/terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## 2. Push images

From repo root:

```bash
docker login

docker build -t chriscrossington/auth:latest -f auth/dockerfile auth
docker push chriscrossington/auth:latest

docker build -t chriscrossington/tickets:latest -f tickets/dockerfile tickets
docker push chriscrossington/tickets:latest

docker build -t chriscrossington/client:latest -f client/dockerfile client
docker push chriscrossington/client:latest
```

## 3. Bootstrap k3s and app

Requires `.kubectl.env` at repo root with `JWT_KEY=...`.

```bash
./infra/aws/scripts/k3s-bootstrap.sh
```

The script fetches remote kubeconfig, installs ingress-nginx, creates the `ticketing` namespace/secret, and applies `infra/aws/k3s-mirror/`.

## 4. Test

```bash
PUBLIC_IP=$(terraform -chdir=infra/aws/terraform output -raw public_ip)

curl -i http://$PUBLIC_IP/
curl -i http://$PUBLIC_IP/api/users/currentuser
```

Browser:

```text
http://EC2_PUBLIC_IP
```

## Cost

Current running cost is mainly:

- EC2 `t3.medium`: about `$0.045-$0.05/hour`
- EBS root volume: small storage cost
- Public IPv4 address: about `$0.005/hour`

Approximate total while running:

```text
$0.05-$0.06/hour
$1.20-$1.50/day
$35-$45/month if left running
```

VPC, subnets, route table, security group, internet gateway, IAM role, and key pair are free/near-free. No NAT Gateway, ALB, RDS, Route 53, or ECR repos are used yet.

## Teardown

```bash
cd infra/aws/terraform
terraform destroy
```

## Notes

- Current instance type is `t3.medium` for enough RAM to run k3s plus app pods.
- No domain/HTTPS yet. AWS manifests set `COOKIE_SECURE=false` so auth works over plain HTTP.
- Do not commit Terraform state, plans, real `.tfvars`, `.kubectl.env`, or `k3s.yaml`.
