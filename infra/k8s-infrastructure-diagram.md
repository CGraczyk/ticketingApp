# Kubernetes Infrastructure Diagram

Ground truth for the Kubernetes app shape. Local Docker Desktop uses `infra/k8s/`; AWS k3s uses `infra/aws/k3s-mirror/`.

```mermaid
flowchart TB
  User["Browser"]
  Images[("Container images\nlocal Skaffold or Docker Hub")]

  subgraph Cluster["Kubernetes cluster"]
    subgraph IngressNS["Namespace: ingress-nginx"]
      IngressSvc["Service\ningress-nginx-controller\n80 / 443"]
      IngressPod["Pod / Deployment\ningress-nginx-controller"]
    end

    subgraph AppNS["App namespace\nlocal: default\nAWS: ticketing"]
      AppIngress["Ingress\ningress-service"]
      JwtSecret["Secret\njwt-secret"]

      ClientSvc["Service\nclient-srv :3000"]
      ClientPod["Deployment / Pod\nclient-depl\nchriscrossington/client"]

      AuthSvc["Service\nauth-srv :3000"]
      AuthPod["Deployment / Pod\nauth-depl\nchriscrossington/auth"]
      AuthMongoSvc["Service\nauth-mongo-srv :27017"]
      AuthMongoPod["Deployment / Pod\nauth-mongo-depl\nmongo"]

      TicketsSvc["Service\ntickets-srv :3000"]
      TicketsPod["Deployment / Pod\ntickets-depl\nchriscrossington/tickets"]
      TicketsMongoSvc["Service\ntickets-mongo-srv :27017"]
      TicketsMongoPod["Deployment / Pod\ntickets-mongo-depl\nmongo"]

      NatsSvc["Service\nnats-srv :4222 / :8222"]
      NatsPod["Deployment / Pod\nnats-depl\nnats-streaming"]
    end
  end

  User -->|HTTP| IngressSvc
  IngressSvc --> IngressPod
  IngressPod --> AppIngress

  AppIngress -->|"/"| ClientSvc --> ClientPod
  AppIngress -->|"/api/users"| AuthSvc --> AuthPod
  AppIngress -->|"/api/tickets"| TicketsSvc --> TicketsPod

  ClientPod -. "server-side API calls use ingress-nginx service DNS" .-> IngressSvc

  JwtSecret -. "JWT_KEY env" .-> AuthPod
  JwtSecret -. "JWT_KEY env" .-> TicketsPod

  AuthPod -->|MONGO_URI| AuthMongoSvc --> AuthMongoPod
  TicketsPod -->|MONGO_URI| TicketsMongoSvc --> TicketsMongoPod
  TicketsPod -->|NATS_URL| NatsSvc --> NatsPod

  Images -. pulled or loaded .-> ClientPod
  Images -. pulled or loaded .-> AuthPod
  Images -. pulled or loaded .-> TicketsPod
```

## Environment differences

| Concern | Local Docker Desktop | AWS k3s mirror |
| --- | --- | --- |
| Manifests | `infra/k8s/` | `infra/aws/k3s-mirror/` |
| Image source | local Skaffold build | Docker Hub `:latest` |
| Namespace | default | `ticketing` |
| Public entry | `http://ticketing.dev` | `http://EC2_PUBLIC_IP` |
| Ingress host rule | `ticketing.dev` | no host rule |
| Cookie security | secure by default | `COOKIE_SECURE=false` for HTTP demo |
| Databases | MongoDB pods | MongoDB pods |
| Event bus | NATS Streaming pod | NATS Streaming pod |

## Key points

- Ingress routes HTTP to Services; Services select Pods created by Deployments.
- Auth and tickets both read `JWT_KEY` from `jwt-secret`.
- MongoDB and NATS are in-cluster demo dependencies, not managed cloud services.
- No persistent volumes are configured for MongoDB in this demo.
