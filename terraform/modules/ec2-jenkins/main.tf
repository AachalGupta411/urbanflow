data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

locals {
  common_tags = merge(var.tags, {
    Module = "ec2-jenkins"
  })

  user_data = templatefile("${path.module}/user-data.sh", {
    project_name           = var.project_name
    environment            = var.environment
    aws_region             = var.aws_region
    cluster_name           = var.cluster_name
    jenkins_admin_password = var.jenkins_admin_password
  })
}

resource "aws_instance" "jenkins" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile   = var.instance_profile_name
  user_data              = local.user_data
  associate_public_ip_address = var.associate_public_ip

  key_name = var.key_name != "" ? var.key_name : null

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.volume_size
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-jenkins"
    Role = "jenkins"
  })

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

resource "aws_eip" "jenkins" {
  count = var.associate_public_ip ? 1 : 0

  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-jenkins-eip"
  })
}

resource "aws_eip_association" "jenkins" {
  count = var.associate_public_ip ? 1 : 0

  instance_id   = aws_instance.jenkins.id
  allocation_id = aws_eip.jenkins[0].id
}
