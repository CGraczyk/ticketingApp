#!/bin/bash
set -euxo pipefail

dnf update -y
dnf install -y nginx
systemctl enable nginx
systemctl start nginx

echo "Hello from Terraform EC2 lab" > /usr/share/nginx/html/index.html
