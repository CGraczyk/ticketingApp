# AWS Infrastructure Diagram

Current AWS demo environment created from `infra/aws/terraform/`.

```mermaid
flowchart TD
  Dev[Developer laptop]
  Browser[Browser]
  DockerHub[Docker Hub images]

  Dev -->|terraform apply| TF[Terraform]
  Dev -->|kubectl via k3s.yaml| API[k3s API :6443]
  Dev -->|docker push| DockerHub
  Browser -->|HTTP :80| PublicIP[EC2 public IP]

  subgraph AWS[AWS account - eu-central-1]
    subgraph VPC[VPC 10.0.0.0/24]
      IGW[Internet Gateway]
      RT[Public route table\n0.0.0.0/0 -> IGW]
      SG[EC2 security group\n22 home IP\n6443 home IP\n80 anywhere]

      subgraph SubnetA[Public subnet A]
        EC2[EC2 t3.medium\nAmazon Linux 2023\nk3s server]
      end

      subgraph SubnetB[Public subnet B\nreserved for later]
        Empty[No workload yet]
      end
    end

    IAM[IAM instance profile\nECR read-only\nSSM managed instance]
  end

  TF --> VPC
  IGW --- RT
  RT --- SubnetA
  RT --- SubnetB
  SG --- EC2
  IAM --- EC2
  PublicIP --- EC2
  API --- EC2
  DockerHub -->|image pull| EC2

  subgraph EC2Runtime[Inside EC2]
    K3S[k3s + containerd]
    NGINX[ingress-nginx]
    Apps[Ticketing app pods]
    K3S --> NGINX
    K3S --> Apps
  end

  EC2 --> EC2Runtime
  PublicIP --> NGINX
```

## Notes

- No ALB, NAT Gateway, Route 53, ACM, RDS, or ECR repos yet.
- Public HTTP is used for the demo; app manifests set `COOKIE_SECURE=false`.
- `6443` is open only to the hardcoded home IP for laptop `kubectl`.
