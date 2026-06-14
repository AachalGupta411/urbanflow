variable "project_name" {
  description = "Project name used as a prefix for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID where the monitoring EC2 instance is launched."
  type        = string
}

variable "security_group_id" {
  description = "Security group ID attached to the monitoring instance."
  type        = string
}

variable "vpc_cidr_block" {
  description = "VPC CIDR block used for Prometheus scrape targets."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the monitoring host."
  type        = string
  default     = "t3.medium"
}

variable "volume_size" {
  description = "Root EBS volume size in GiB."
  type        = number
  default     = 50
}

variable "key_name" {
  description = "Optional EC2 key pair name for SSH access."
  type        = string
  default     = ""
}

variable "eks_cluster_name" {
  description = "EKS cluster name for service discovery configuration."
  type        = string
}

variable "tags" {
  description = "Additional tags for monitoring EC2 resources."
  type        = map(string)
  default     = {}
}
