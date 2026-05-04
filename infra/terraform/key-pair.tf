resource "aws_key_pair" "main" {
  key_name   = "ticketing-dev-key"
  public_key = file("~/.ssh/id_ed25519.pub")

  tags = {
    Name = "ticketing-dev-key"
  }
}
