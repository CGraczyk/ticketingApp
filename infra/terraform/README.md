# Terraform AWS Lab

Minimal Terraform infrastructure for deploying this app to AWS step by step.

Current goal:

```text
Subgoal 1: one running EC2 instance on a personal AWS account
```

## Current resources

Terraform currently creates:

- VPC: `10.0.0.0/24`
- 2 public subnets
- Internet Gateway
- Public route table
- Security group
  - SSH `22` from hardcoded home IP only
  - HTTP `80` from anywhere
- EC2 key pair from `~/.ssh/id_ed25519.pub`
- Amazon Linux 2023 EC2 instance
- nginx test page via user data

## Files

```text
versions.tf
providers.tf
variables.tf
vpc.tf
subnets.tf
internet-gateway.tf
route-tables.tf
security-groups.tf
key-pair.tf
ec2.tf
outputs.tf
user-data-nginx.sh
```

## Deploy

```bash
cd infra/terraform
terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

## Test

```bash
terraform output
curl $(terraform output -raw http_url)
$(terraform output -raw ssh_command)
```

Expected HTTP response:

```text
Hello from Terraform EC2 lab
```

## Teardown

```bash
cd infra/terraform
terraform destroy
```

## Notes

- Region defaults to `eu-central-1`.
- SSH access is hardcoded in `security-groups.tf`; update it if your public IP changes.
- Do not commit state files, tfvars, plans, or kubeconfigs.
- This stage has no NAT Gateway, ALB, RDS, ECR, or Kubernetes yet.
