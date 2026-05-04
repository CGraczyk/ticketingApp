# AWS Infrastructure Diagram

Ground truth for the current AWS demo created from `infra/aws/terraform/` and bootstrapped by `infra/aws/scripts/k3s-bootstrap.sh`.

```mermaid
flowchart TB
  subgraph Local["Developer laptop"]
    TF["terraform CLI"]
    Docker["docker build / push"]
    Kubectl["kubectl using infra/aws/terraform/k3s.yaml"]
    SSH["ssh ec2-user"]
    Browser["Browser"]
  end

  DockerHub[("Docker Hub\nchriscrossington/*:latest")]
  Internet["Internet"]

  Docker -->|push images| DockerHub
  Browser -->|HTTP :80| Internet
  SSH -->|SSH :22| Internet
  Kubectl -->|Kubernetes API :6443| Internet

  subgraph AWS["AWS account - eu-central-1"]
    AWSApi["AWS APIs"]

    subgraph VPC["VPC ticketing-vpc\n10.0.0.0/24"]
      IGW["Internet Gateway"]
      RT["Public route table\n0.0.0.0/0 -> IGW"]
      SG["Security group ticketing-ec2-sg\n22 from home IP\n6443 from home IP\n80 from anywhere\negress all"]

      subgraph PublicA["Public subnet A\n10.0.0.0/26"]
        EC2["EC2 ticketing-dev-ec2\nt3.medium\nAmazon Linux 2023\nauto public IPv4"]
      end

      subgraph PublicB["Public subnet B\n10.0.0.64/26"]
        Reserved["No workload yet"]
      end
    end

    KeyPair["EC2 key pair\n~/.ssh/id_ed25519.pub"]
    IAM["IAM instance profile\nECR read-only\nSSM managed instance"]
  end

  TF -. creates and updates .-> AWSApi
  AWSApi -. manages .-> VPC
  AWSApi -. manages .-> KeyPair
  AWSApi -. manages .-> IAM
  AWSApi -. manages .-> EC2

  Internet --> IGW --> RT --> SG --> EC2
  EC2 -. uses .-> KeyPair
  EC2 -. assumes .-> IAM

  subgraph Runtime["Inside the EC2 instance"]
    CloudInit["cloud-init user-data-k3s.sh"]
    K3S["k3s server\nTraefik disabled"]
    Containerd["containerd image runtime"]
    ServiceLB["k3s ServiceLB\nhost ports 80/443"]
    IngressNginx["ingress-nginx"]
    Ticketing["ticketing namespace\nclient auth tickets mongo nats"]
  end

  EC2 --> CloudInit --> K3S
  K3S --> Containerd
  K3S --> ServiceLB --> IngressNginx --> Ticketing
  DockerHub -->|pull images| Containerd
```

## Key points

- Terraform creates AWS infrastructure and installs k3s through EC2 user data.
- The bootstrap script installs ingress-nginx and applies Kubernetes manifests.
- There is no AWS load balancer; k3s ServiceLB exposes ingress-nginx on the EC2 host.
- There is no NAT Gateway, ALB, Route 53, ACM, RDS, or ECR repository yet.
- Public HTTP is used for the demo; app manifests set `COOKIE_SECURE=false`.
