# AWS Infrastructure Diagram

Abstract view of the current AWS demo deployment.

```mermaid
flowchart TD
  Laptop["Developer laptop\nTerraform / Docker / kubectl"]
  Browser["Browser"]
  DockerHub[("Docker Hub\napp images")]

  subgraph AWS["AWS eu-central-1"]
    subgraph VPC["VPC 10.0.0.0/24"]
      IGW["Internet Gateway"]

      subgraph PublicSubnets["Public subnets"]
        EC2["EC2 t3.medium\nAmazon Linux 2023\nk3s cluster"]
        Spare["Subnet B\nunused for now"]
      end

      SG["Security group\n80 public\n22 + 6443 home IP only"]
    end

    IAM["EC2 IAM role\nSSM + ECR read-only"]
  end

  Laptop -->|terraform apply| AWS
  Laptop -->|docker push| DockerHub
  Laptop -->|kubectl :6443 / ssh :22| SG
  Browser -->|HTTP :80| IGW

  IGW --> SG --> EC2
  IAM -. attached .-> EC2
  DockerHub -->|image pulls| EC2

  subgraph K3S["Inside EC2 / k3s"]
    Ingress["ingress-nginx"]
    App["ticketing app pods\nclient / auth / tickets\nmongo / nats"]
    Ingress --> App
  end

  EC2 --> K3S
```

## Notes

- Terraform owns AWS infrastructure; Kubernetes manifests are applied after k3s is ready.
- There is no AWS Load Balancer yet; HTTP enters through the EC2 public IP.
- No NAT Gateway, RDS, Route 53, ACM, or ECR repositories are used yet.
