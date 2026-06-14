variable "project_name" {
  description = "Project name used as a prefix for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "backup_bucket_arn" {
  description = "ARN of the S3 bucket used for MySQL backups."
  type        = string
}

variable "eks_cluster_name" {
  description = "Name of the EKS cluster Jenkins needs to deploy to."
  type        = string
}

variable "tags" {
  description = "Additional tags for IAM resources."
  type        = map(string)
  default     = {}
}
