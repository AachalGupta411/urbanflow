output "alb_security_group_id" {
  description = "ID of the ALB security group."
  value       = aws_security_group.alb.id
}

output "eks_cluster_security_group_id" {
  description = "ID of the EKS cluster security group."
  value       = aws_security_group.eks_cluster.id
}

output "eks_nodes_security_group_id" {
  description = "ID of the EKS worker nodes security group."
  value       = aws_security_group.eks_nodes.id
}

output "jenkins_security_group_id" {
  description = "ID of the Jenkins security group."
  value       = aws_security_group.jenkins.id
}

output "database_security_group_id" {
  description = "ID of the database security group."
  value       = aws_security_group.database.id
}

output "monitoring_security_group_id" {
  description = "ID of the monitoring security group."
  value       = aws_security_group.monitoring.id
}
