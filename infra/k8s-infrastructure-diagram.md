# Kubernetes Infrastructure Diagram

Logical Kubernetes environment used by local Docker Desktop and AWS k3s.

```mermaid
flowchart TD
  User[Browser]
  Images[Container images\nlocal Skaffold or Docker Hub]

  subgraph Cluster[Kubernetes cluster]
    subgraph IngressNS[namespace: ingress-nginx]
      IngressController[ingress-nginx controller]
      IngressSvc[ingress-nginx-controller Service]
    end

    subgraph TicketingNS[namespace: ticketing in AWS\ndefault namespace locally]
      Ingress[Ingress: ingress-service]
      JwtSecret[Secret: jwt-secret]

      ClientDep[Deployment: client-depl\nimage: chriscrossington/client]
      ClientSvc[Service: client-srv :3000]

      AuthDep[Deployment: auth-depl\nimage: chriscrossington/auth]
      AuthSvc[Service: auth-srv :3000]
      AuthMongoDep[Deployment: auth-mongo-depl\nimage: mongo]
      AuthMongoSvc[Service: auth-mongo-srv :27017]

      TicketsDep[Deployment: tickets-depl\nimage: chriscrossington/tickets]
      TicketsSvc[Service: tickets-srv :3000]
      TicketsMongoDep[Deployment: tickets-mongo-depl\nimage: mongo]
      TicketsMongoSvc[Service: tickets-mongo-srv :27017]

      NatsDep[Deployment: nats-depl\nimage: nats-streaming]
      NatsSvc[Service: nats-srv :4222/:8222]
    end
  end

  User -->|HTTP| IngressSvc
  IngressSvc --> IngressController
  IngressController --> Ingress

  Ingress -->|/| ClientSvc
  Ingress -->|/api/users| AuthSvc
  Ingress -->|/api/tickets| TicketsSvc

  ClientSvc --> ClientDep
  AuthSvc --> AuthDep
  TicketsSvc --> TicketsDep

  AuthDep --> AuthMongoSvc --> AuthMongoDep
  TicketsDep --> TicketsMongoSvc --> TicketsMongoDep
  TicketsDep --> NatsSvc --> NatsDep

  JwtSecret -. JWT_KEY .-> AuthDep
  JwtSecret -. JWT_KEY .-> TicketsDep
  Images --> ClientDep
  Images --> AuthDep
  Images --> TicketsDep
```

## Environment differences

| Concern | Local Docker Desktop | AWS k3s mirror |
| --- | --- | --- |
| Manifests | `infra/k8s/` | `infra/aws/k3s-mirror/` |
| Images | local Skaffold build | Docker Hub `:latest` |
| Namespace | default | `ticketing` |
| Ingress host | `ticketing.dev` | no host; EC2 public IP |
| Cookie security | normal app default | `COOKIE_SECURE=false` for HTTP demo |
