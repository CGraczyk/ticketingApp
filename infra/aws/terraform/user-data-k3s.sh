#!/bin/bash
set -euxo pipefail

dnf update -y
dnf install -y git tar gzip jq

PUBLIC_IPV4=$(curl -fsS https://checkip.amazonaws.com | tr -d '\n')
test -n "$PUBLIC_IPV4"

curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik --tls-san ${PUBLIC_IPV4} --write-kubeconfig-mode 644" sh -

echo 'alias k8="sudo kubectl"' >> /home/ec2-user/.bashrc
