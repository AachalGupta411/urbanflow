output "vpc_id" {
  description = "ID of the UrbanFlow VPC."
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the UrbanFlow VPC."
  value       = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets."
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of private subnets used by EKS."
  value       = module.vpc.private_subnet_ids
}

output "database_subnet_ids" {
  description = "IDs of database subnets for RDS."
  value       = module.vpc.database_subnet_ids
}

output "database_subnet_group_name" {
  description = "Name of the RDS DB subnet group."
  value       = module.vpc.database_subnet_group_name
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster."
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "Endpoint URL for the EKS Kubernetes API server."
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_version" {
  description = "Kubernetes version running on the EKS cluster."
  value       = module.eks.cluster_version
}

output "eks_oidc_issuer_url" {
  description = "OIDC issuer URL for IRSA configuration."
  value       = module.eks.oidc_issuer_url
}

output "jenkins_public_ip" {
  description = "Public IP address of the Jenkins EC2 instance."
  value       = module.ec2_jenkins.public_ip
}

output "jenkins_url" {
  description = "URL to access the Jenkins web UI."
  value       = module.ec2_jenkins.jenkins_url
}

output "jenkins_instance_id" {
  description = "EC2 instance ID of the Jenkins server."
  value       = module.ec2_jenkins.instance_id
}

output "monitoring_public_ip" {
  description = "Public IP address of the Prometheus monitoring host."
  value       = module.monitoring.public_ip
}

output "prometheus_url" {
  description = "URL to access the Prometheus web UI."
  value       = module.monitoring.prometheus_url
}

output "backup_bucket_name" {
  description = "Name of the S3 bucket used for MySQL backups."
  value       = aws_s3_bucket.backups.id
}

output "backup_bucket_arn" {
  description = "ARN of the S3 backup bucket."
  value       = aws_s3_bucket.backups.arn
}

output "security_group_ids" {
  description = "Map of security group IDs by role."
  value = {
    alb        = module.security_groups.alb_security_group_id
    eks_cluster = module.security_groups.eks_cluster_security_group_id
    eks_nodes  = module.security_groups.eks_nodes_security_group_id
    jenkins    = module.security_groups.jenkins_security_group_id
    database   = module.security_groups.database_security_group_id
    monitoring = module.security_groups.monitoring_security_group_id
  }
}

output "iam_role_arns" {
  description = "Map of IAM role ARNs by purpose."
  value = {
    eks_cluster = module.iam.eks_cluster_role_arn
    eks_node    = module.iam.eks_node_role_arn
    jenkins     = module.iam.jenkins_role_arn
    s3_backup   = aws_iam_role.s3_backup.arn
  }
}

output "jenkins_admin_password" {
  description = "Initial Jenkins admin password (retrieve once after first apply)."
  value       = random_password.jenkins_admin.result
  sensitive   = true
}
