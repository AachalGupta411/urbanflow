output "eks_cluster_role_arn" {
  description = "ARN of the EKS cluster IAM role."
  value       = aws_iam_role.eks_cluster.arn
}

output "eks_cluster_role_name" {
  description = "Name of the EKS cluster IAM role."
  value       = aws_iam_role.eks_cluster.name
}

output "eks_node_role_arn" {
  description = "ARN of the EKS node group IAM role."
  value       = aws_iam_role.eks_node.arn
}

output "eks_node_role_name" {
  description = "Name of the EKS node group IAM role."
  value       = aws_iam_role.eks_node.name
}

output "eks_node_instance_profile_name" {
  description = "Name of the EKS node instance profile."
  value       = aws_iam_instance_profile.eks_node.name
}

output "jenkins_role_arn" {
  description = "ARN of the Jenkins deploy IAM role."
  value       = aws_iam_role.jenkins.arn
}

output "jenkins_instance_profile_name" {
  description = "Name of the Jenkins EC2 instance profile."
  value       = aws_iam_instance_profile.jenkins.name
}
