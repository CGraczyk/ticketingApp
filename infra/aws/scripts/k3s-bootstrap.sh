#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TF_DIR="$ROOT_DIR/infra/aws/terraform"
KUBECONFIG_FILE="$TF_DIR/k3s.yaml"
NAMESPACE="ticketing"

PUBLIC_IP="$(terraform -chdir="$TF_DIR" output -raw public_ip)"

echo "Waiting for k3s on $PUBLIC_IP..."
until ssh "ec2-user@$PUBLIC_IP" 'test -f /etc/rancher/k3s/k3s.yaml'; do
  sleep 10
done

rm -f "$KUBECONFIG_FILE"
ssh "ec2-user@$PUBLIC_IP" 'sudo cat /etc/rancher/k3s/k3s.yaml' > "$KUBECONFIG_FILE"
sed -i "s/127.0.0.1/$PUBLIC_IP/g" "$KUBECONFIG_FILE"
export KUBECONFIG="$KUBECONFIG_FILE"

kubectl get nodes

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.14.1/deploy/static/provider/cloud/deploy.yaml
kubectl rollout status deployment/ingress-nginx-controller -n ingress-nginx --timeout=180s

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic jwt-secret \
  --namespace "$NAMESPACE" \
  --from-env-file="$ROOT_DIR/.kubectl.env" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -n "$NAMESPACE" -f "$ROOT_DIR/infra/aws/k3s-mirror/"
kubectl get pods -n "$NAMESPACE"
kubectl get ingress -n "$NAMESPACE"

echo "App URL: http://$PUBLIC_IP"
