resource "aws_security_group" "ec2" {
  name        = "ticketing-ec2-sg"
  description = "Security group for the ticketing EC2 instance"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "ticketing-ec2-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ssh_from_home" {
  security_group_id = aws_security_group.ec2.id
  description       = "Allow SSH from home IP"

  cidr_ipv4   = "92.211.1.206/32"
  from_port   = 22
  ip_protocol = "tcp"
  to_port     = 22
}

resource "aws_vpc_security_group_ingress_rule" "kubernetes_api_from_home" {
  security_group_id = aws_security_group.ec2.id
  description       = "Allow Kubernetes API from home IP"

  cidr_ipv4   = "92.211.1.206/32"
  from_port   = 6443
  ip_protocol = "tcp"
  to_port     = 6443
}

resource "aws_vpc_security_group_ingress_rule" "http_from_anywhere" {
  security_group_id = aws_security_group.ec2.id
  description       = "Allow HTTP from anywhere"

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 80
  ip_protocol = "tcp"
  to_port     = 80
}

resource "aws_vpc_security_group_egress_rule" "all_outbound" {
  security_group_id = aws_security_group.ec2.id
  description       = "Allow all outbound traffic"

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}
