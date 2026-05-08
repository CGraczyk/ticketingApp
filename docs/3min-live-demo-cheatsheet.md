# TicketingApp 3-minute presentation — live demo cheatsheet

## Pre-flight before presenting

Run these once before the presentation starts:

```bash
cd /home/chriscrossington/git/ticketingApp
export KUBECONFIG=$PWD/infra/aws/terraform/k3s.yaml
PUBLIC_IP=$(terraform -chdir=infra/aws/terraform output -raw public_ip)

echo "http://$PUBLIC_IP"
kubectl get pods -n ticketing
curl -i http://$PUBLIC_IP/api/users/currentuser
```

Expected:

- all app pods in `ticketing` are `Running`
- frontend returns `HTTP/1.1 200 OK`
- current user API returns `{"currentUser":null}` when not signed in

## Demo commands to show live

```bash
export KUBECONFIG=$PWD/infra/aws/terraform/k3s.yaml
PUBLIC_IP=$(terraform -chdir=infra/aws/terraform output -raw public_ip)

kubectl get pods,svc,ingress -n ticketing
curl -i http://$PUBLIC_IP/api/users/currentuser
```

Then open the browser:

```text
http://EC2_PUBLIC_IP
```

## Browser flow

1. Landing page loads.
2. Go to sign up or sign in.
3. Show signed-in header.
4. Create/view a ticket if time allows.

## 45-second narration

"Here I am using the kubeconfig generated for the remote k3s cluster. The pods show the three app services plus MongoDB and NATS. The ingress exposes one public entry point on port 80, and this curl call reaches the auth service through that ingress. Now I open the EC2 public IP in the browser, sign in, and the frontend talks to the backend services through the same route."

## Backup if browser/login is slow

Show these instead:

```bash
curl -i http://$PUBLIC_IP/
curl -i http://$PUBLIC_IP/api/users/currentuser
kubectl logs -n ticketing deploy/auth-depl --tail=20
```

Close with:

"Even if I do not click through every feature, this proves the deployed path: public EC2 IP → ingress-nginx → Kubernetes services → app pods."
