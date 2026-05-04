# Terraform AWS Infrastructure

Terraform for the AWS k3s demo environment.

## Resources

Creates:

- VPC `10.0.0.0/24`
- 2 public subnets
- Internet Gateway
- public route table
- security group
  - SSH `22` from hardcoded home IP
  - Kubernetes API `6443` from hardcoded home IP
  - HTTP `80` from anywhere
- EC2 key pair from `~/.ssh/id_ed25519.pub`
- IAM role/profile with ECR read-only and SSM managed-instance policies
- Amazon Linux 2023 EC2 instance, currently `t3.medium`
- k3s via user data

## Deploy

```bash
cd infra/aws/terraform
terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

## k3s user data

`user-data-k3s.sh`:

- installs small utility packages
- detects the EC2 public IP via `https://checkip.amazonaws.com`
- installs k3s with Traefik disabled
- adds the public IP as a TLS SAN for laptop `kubectl`
- adds `k8="sudo kubectl"` alias on the EC2 instance

## Configure laptop kubectl manually

Normally use `../scripts/k3s-bootstrap.sh`. Manual setup:

```bash
cd infra/aws/terraform

PUBLIC_IP=$(terraform output -raw public_ip)

until ssh ec2-user@$PUBLIC_IP 'test -f /etc/rancher/k3s/k3s.yaml'; do
  echo "waiting for k3s..."
  sleep 10
done

rm -f ./k3s.yaml
ssh ec2-user@$PUBLIC_IP 'sudo cat /etc/rancher/k3s/k3s.yaml' > ./k3s.yaml
sed -i "s/127.0.0.1/$PUBLIC_IP/g" ./k3s.yaml

export KUBECONFIG=$PWD/k3s.yaml
kubectl get nodes
kubectl get pods -A
```

## kubectl context

Remote k3s:

```bash
export KUBECONFIG=$PWD/infra/aws/terraform/k3s.yaml
kubectl get nodes
```

Local Docker Desktop:

```bash
unset KUBECONFIG
kubectl config use-context docker-desktop
kubectl get nodes
```

Check current target:

```bash
echo $KUBECONFIG
kubectl config current-context
```

## Teardown

```bash
cd infra/aws/terraform
terraform destroy
```

## Notes

- Region defaults to `eu-central-1`.
- Update `security-groups.tf` if your public IP changes.
- No NAT Gateway, ALB, RDS, ECR repos, Route 53, or HTTPS yet.
- Terraform state, plans, `.tfvars`, and `k3s.yaml` must stay uncommitted.
