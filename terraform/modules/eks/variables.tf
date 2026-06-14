variable "project_name" {
  description = "Project name used as a prefix for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "cluster_name" {
  description = "Name of the EKS cluster."
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS control plane."
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where the EKS cluster is deployed."
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for EKS control plane and worker nodes."
  type        = list(string)
}

variable "cluster_security_group_id" {
  description = "Security group ID attached to the EKS control plane."
  type        = string
}

variable "node_security_group_id" {
  description = "Security group ID attached to EKS worker nodes."
  type        = string
}

variable "cluster_role_arn" {
  description = "IAM role ARN for the EKS cluster."
  type        = string
}

variable "node_role_arn" {
  description = "IAM role ARN for EKS worker nodes."
  type        = string
}

variable "node_instance_types" {
  description = "EC2 instance types for the managed node group."
  type        = list(string)
}

variable "node_desired_size" {
  description = "Desired number of worker nodes."
  type        = number
}

variable "node_min_size" {
  description = "Minimum number of worker nodes."
  type        = number
}

variable "node_max_size" {
  description = "Maximum number of worker nodes."
  type        = number
}

variable "node_disk_size" {
  description = "Root volume size in GiB for worker nodes."
  type        = number
}

variable "enable_cluster_endpoint_public_access" {
  description = "Whether the EKS API server endpoint is publicly accessible."
  type        = bool
  default     = true
}

variable "enable_cluster_endpoint_private_access" {
  description = "Whether the EKS API server endpoint is accessible from within the VPC."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for EKS resources."
  type        = map(string)
  default     = {}
}
