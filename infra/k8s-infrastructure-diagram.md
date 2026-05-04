# Kubernetes Infrastructure Diagram

Abstract view of the app running in Kubernetes.

```mermaid
flowchart TD
  User["Browser"]
  Images[("Images\nlocal Skaffold or Docker Hub")]

  subgraph Cluster["Kubernetes cluster"]
    IngressNginx["ingress-nginx controller"]

    subgraph App["Ticketing app namespace\nlocal: default / AWS: ticketing"]
      Ingress["Ingress\ningress-service"]

      Client["client\nNext.js UI"]
      Auth["auth API"]
      Tickets["tickets API"]

      AuthMongo[("auth MongoDB")]
      TicketsMongo[("tickets MongoDB")]
      Nats[("NATS Streaming")]
      Jwt["jwt-secret"]
    end
  end

  User -->|HTTP| IngressNginx --> Ingress

  Ingress -->|/| Client
  Ingress -->|/api/users| Auth
  Ingress -->|/api/tickets| Tickets

  Auth --> AuthMongo
  Tickets --> TicketsMongo
  Tickets --> Nats

  Jwt -.-> Auth
  Jwt -.-> Tickets
  Images -.-> Client
  Images -.-> Auth
  Images -.-> Tickets
```

## Local vs AWS mirror

| Concern | Local | AWS k3s |
| --- | --- | --- |
| Manifests | `infra/k8s/` | `infra/aws/k3s-mirror/` |
| Images | local Skaffold | Docker Hub `:latest` |
| Public URL | `ticketing.dev` | EC2 public IP |
| Namespace | default | `ticketing` |
| Cookie mode | secure default | `COOKIE_SECURE=false` for HTTP demo |

## Notes

- Ingress is the public HTTP router.
- MongoDB and NATS are demo pods inside the cluster, not managed services.
- MongoDB has no persistent volumes in this version.
