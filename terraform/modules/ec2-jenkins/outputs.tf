output "instance_id" {
  description = "ID of the Jenkins EC2 instance."
  value       = aws_instance.jenkins.id
}

output "private_ip" {
  description = "Private IP address of the Jenkins instance."
  value       = aws_instance.jenkins.private_ip
}

output "public_ip" {
  description = "Public IP address of the Jenkins instance (Elastic IP when associated)."
  value       = var.associate_public_ip ? aws_eip.jenkins[0].public_ip : null
}

output "jenkins_url" {
  description = "URL to access the Jenkins web UI."
  value       = var.associate_public_ip ? "http://${aws_eip.jenkins[0].public_ip}:8080" : "http://${aws_instance.jenkins.private_ip}:8080"
}
