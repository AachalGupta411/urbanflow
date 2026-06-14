variable "aws_region" {
  description = "AWS region for the staging environment."
  type        = string
}

variable "project_name" {
  description = "Project name prefix for staging resources."
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block for staging."
  type        = string
}

variable "availability_zones" {
  description = "Availability zones for staging subnets."
  type        = list(string)
}

variable "single_nat_gateway" {
  description = "Use a single NAT gateway in staging."
  type        = bool
}

variable "kubernetes_version" {
  description = "EKS Kubernetes version for staging."
  type        = string
}

variable "eks_node_instance_types" {
  description = "EKS worker instance types for staging."
  type        = list(string)
}

variable "eks_node_desired_size" {
  description = "Desired EKS worker count for staging."
  type        = number
}

variable "eks_node_min_size" {
  description = "Minimum EKS worker count for staging."
  type        = number
}

variable "eks_node_max_size" {
  description = "Maximum EKS worker count for staging."
  type        = number
}

variable "eks_node_disk_size" {
  description = "EKS worker disk size for staging."
  type        = number
}

variable "jenkins_instance_type" {
  description = "Jenkins EC2 instance type for staging."
  type        = string
}

variable "jenkins_volume_size" {
  description = "Jenkins root volume size for staging."
  type        = number
}

variable "jenkins_key_name" {
  description = "EC2 key pair for Jenkins SSH in staging."
  type        = string
}

variable "jenkins_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access Jenkins in staging."
  type        = list(string)
}

variable "monitoring_instance_type" {
  description = "Monitoring EC2 instance type for staging."
  type        = string
}

variable "monitoring_volume_size" {
  description = "Monitoring root volume size for staging."
  type        = number
}

variable "monitoring_key_name" {
  description = "EC2 key pair for monitoring SSH in staging."
  type        = string
}

variable "monitoring_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access monitoring in staging."
  type        = list(string)
}

variable "backup_bucket_name" {
  description = "Optional explicit S3 backup bucket name for staging."
  type        = string
}

variable "backup_retention_days" {
  description = "S3 backup retention days for staging."
  type        = number
}

variable "enable_cluster_endpoint_public_access" {
  description = "Enable public EKS API endpoint in staging."
  type        = bool
}

variable "enable_cluster_endpoint_private_access" {
  description = "Enable private EKS API endpoint in staging."
  type        = bool
}

variable "tags" {
  description = "Additional tags for staging resources."
  type        = map(string)
}
