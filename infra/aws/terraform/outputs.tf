output "public_ip" {
  description = "Public IP address of the EC2 instance."
  value       = aws_instance.main.public_ip
}

output "public_dns" {
  description = "Public DNS name of the EC2 instance."
  value       = aws_instance.main.public_dns
}

output "http_url" {
  description = "HTTP URL for the nginx test page."
  value       = "http://${aws_instance.main.public_ip}"
}

output "ssh_command" {
  description = "SSH command for the EC2 instance."
  value       = "ssh -i ~/.ssh/id_ed25519 ec2-user@${aws_instance.main.public_ip}"
}
