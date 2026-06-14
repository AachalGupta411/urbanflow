output "instance_id" {
  description = "ID of the monitoring EC2 instance."
  value       = aws_instance.monitoring.id
}

output "private_ip" {
  description = "Private IP address of the monitoring instance."
  value       = aws_instance.monitoring.private_ip
}

output "public_ip" {
  description = "Public IP address of the monitoring instance."
  value       = aws_eip.monitoring.public_ip
}

output "prometheus_url" {
  description = "URL to access the Prometheus web UI."
  value       = "http://${aws_eip.monitoring.public_ip}:9090"
}
