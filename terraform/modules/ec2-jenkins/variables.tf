variable "project_name" {
  description = "Project name used as a prefix for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region for EKS kubeconfig generation."
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name for kubectl configuration on Jenkins."
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID where the Jenkins EC2 instance is launched."
  type        = string
}

variable "security_group_id" {
  description = "Security group ID attached to the Jenkins instance."
  type        = string
}

variable "instance_profile_name" {
  description = "IAM instance profile name for Jenkins."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for Jenkins."
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

variable "jenkins_admin_password" {
  description = "Initial Jenkins admin password."
  type        = string
  sensitive   = true
}

variable "associate_public_ip" {
  description = "Whether to associate a public IP with the Jenkins instance."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for Jenkins EC2 resources."
  type        = map(string)
  default     = {}
}
