output "cluster_id" {
  description = "ID of the EKS cluster."
  value       = aws_eks_cluster.main.id
}

output "cluster_name" {
  description = "Name of the EKS cluster."
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "Endpoint URL for the EKS Kubernetes API server."
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_certificate_authority" {
  description = "Base64-encoded certificate authority data for the EKS cluster."
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

output "cluster_version" {
  description = "Kubernetes version running on the EKS cluster."
  value       = aws_eks_cluster.main.version
}

output "cluster_security_group_id" {
  description = "Cluster security group ID created by EKS."
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "node_group_id" {
  description = "ID of the EKS managed node group."
  value       = aws_eks_node_group.main.id
}

output "node_group_arn" {
  description = "ARN of the EKS managed node group."
  value       = aws_eks_node_group.main.arn
}

output "node_group_status" {
  description = "Status of the EKS managed node group."
  value       = aws_eks_node_group.main.status
}

output "oidc_issuer_url" {
  description = "OIDC issuer URL for the EKS cluster (used for IRSA)."
  value       = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

output "oidc_provider_arn" {
  description = "ARN of the IAM OIDC provider for IRSA."
  value       = aws_iam_openid_connect_provider.eks.arn
}
