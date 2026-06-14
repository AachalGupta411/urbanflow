variable "project_name" {
  description = "Project name used as a prefix for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where security groups are created."
  type        = string
}

variable "vpc_cidr_block" {
  description = "CIDR block of the VPC for intra-VPC traffic rules."
  type        = string
}

variable "jenkins_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to reach Jenkins on SSH and HTTP."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "monitoring_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to reach the monitoring host on SSH and Prometheus."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "tags" {
  description = "Additional tags for security group resources."
  type        = map(string)
  default     = {}
}
