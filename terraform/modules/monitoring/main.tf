data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

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
    Module = "monitoring"
  })

  user_data = <<-EOF
    #!/bin/bash
    set -euo pipefail
    exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y curl wget unzip jq

    PROM_VERSION="2.51.2"
    cd /tmp
    wget -q "https://github.com/prometheus/prometheus/releases/download/v$${PROM_VERSION}/prometheus-$${PROM_VERSION}.linux-amd64.tar.gz"
    tar xzf "prometheus-$${PROM_VERSION}.linux-amd64.tar.gz"
    mv "prometheus-$${PROM_VERSION}.linux-amd64/prometheus" /usr/local/bin/
    mv "prometheus-$${PROM_VERSION}.linux-amd64/promtool" /usr/local/bin/
    mkdir -p /etc/prometheus /var/lib/prometheus
    chown -R nobody:nogroup /etc/prometheus /var/lib/prometheus

    cat > /etc/prometheus/prometheus.yml <<PROM
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    scrape_configs:
      - job_name: prometheus
        static_configs:
          - targets: ['localhost:9090']

      - job_name: node
        static_configs:
          - targets: ['localhost:9100']

      - job_name: urbanflow-vpc
        static_configs:
          - targets: []
        relabel_configs:
          - source_labels: [__address__]
            target_label: cluster
            replacement: ${var.eks_cluster_name}
    PROM

    useradd --no-create-home --shell /bin/false prometheus || true
    chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool

    cat > /etc/systemd/system/prometheus.service <<UNIT
    [Unit]
    Description=Prometheus
    Wants=network-online.target
    After=network-online.target

    [Service]
    User=prometheus
    Group=prometheus
    Type=simple
    ExecStart=/usr/local/bin/prometheus \\
      --config.file=/etc/prometheus/prometheus.yml \\
      --storage.tsdb.path=/var/lib/prometheus \\
      --web.listen-address=0.0.0.0:9090 \\
      --web.enable-lifecycle
    Restart=always

    [Install]
    WantedBy=multi-user.target
    UNIT

    NODE_VERSION="1.7.0"
    wget -q "https://github.com/prometheus/node_exporter/releases/download/v$${NODE_VERSION}/node_exporter-$${NODE_VERSION}.linux-amd64.tar.gz"
    tar xzf "node_exporter-$${NODE_VERSION}.linux-amd64.tar.gz"
    mv "node_exporter-$${NODE_VERSION}.linux-amd64/node_exporter" /usr/local/bin/

    cat > /etc/systemd/system/node_exporter.service <<UNIT
    [Unit]
    Description=Node Exporter
    Wants=network-online.target
    After=network-online.target

    [Service]
    User=nobody
    Group=nogroup
    Type=simple
    ExecStart=/usr/local/bin/node_exporter
    Restart=always

    [Install]
    WantedBy=multi-user.target
    UNIT

    systemctl daemon-reload
    systemctl enable prometheus node_exporter
    systemctl start prometheus node_exporter

    echo "UrbanFlow monitoring bootstrap complete"
    EOF
}

resource "aws_instance" "monitoring" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [var.security_group_id]
  associate_public_ip_address = true

  key_name = var.key_name != "" ? var.key_name : null

  user_data = local.user_data

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
    Name = "${var.project_name}-${var.environment}-monitoring"
    Role = "prometheus"
  })

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

resource "aws_eip" "monitoring" {
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-monitoring-eip"
  })
}

resource "aws_eip_association" "monitoring" {
  instance_id   = aws_instance.monitoring.id
  allocation_id = aws_eip.monitoring.id
}
