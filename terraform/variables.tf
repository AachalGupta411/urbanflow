variable "aws_region" {
  description = "AWS region where UrbanFlow infrastructure is provisioned."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name (dev, staging, or prod)."
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Project name used as a prefix for resource naming."
  type        = string
  default     = "urbanflow"
}

variable "vpc_cidr" {
  description = "CIDR block for the UrbanFlow VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to spread subnets across."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "single_nat_gateway" {
  description = "Use a single NAT gateway instead of one per AZ (cost optimization for non-prod)."
  type        = bool
  default     = true
}

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS control plane."
  type        = string
  default     = "1.29"
}

variable "eks_node_instance_types" {
  description = "EC2 instance types for the EKS managed node group."
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_node_desired_size" {
  description = "Desired number of worker nodes in the EKS managed node group."
  type        = number
  default     = 2
}

variable "eks_node_min_size" {
  description = "Minimum number of worker nodes in the EKS managed node group."
  type        = number
  default     = 1
}

variable "eks_node_max_size" {
  description = "Maximum number of worker nodes in the EKS managed node group."
  type        = number
  default     = 4
}

variable "eks_node_disk_size" {
  description = "Root volume size in GiB for EKS worker nodes."
  type        = number
  default     = 50
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for the Jenkins CI/CD server."
  type        = string
  default     = "t3.medium"
}

variable "jenkins_volume_size" {
  description = "Root EBS volume size in GiB for the Jenkins EC2 instance."
  type        = number
  default     = 50
}

variable "jenkins_key_name" {
  description = "Name of an existing EC2 key pair for SSH access to Jenkins."
  type        = string
  default     = ""
}

variable "jenkins_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to reach Jenkins on SSH (22) and HTTP (8080)."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "monitoring_instance_type" {
  description = "EC2 instance type for the Prometheus monitoring host."
  type        = string
  default     = "t3.medium"
}

variable "monitoring_volume_size" {
  description = "Root EBS volume size in GiB for the monitoring EC2 instance."
  type        = number
  default     = 50
}

variable "monitoring_key_name" {
  description = "Name of an existing EC2 key pair for SSH access to the monitoring host."
  type        = string
  default     = ""
}

variable "monitoring_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to reach the monitoring host on SSH (22) and Prometheus (9090)."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "backup_bucket_name" {
  description = "Globally unique S3 bucket name for MySQL backups. Leave empty to auto-generate."
  type        = string
  default     = ""
}

variable "backup_retention_days" {
  description = "Number of days to retain MySQL backup objects in S3 before lifecycle expiration."
  type        = number
  default     = 30
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
  description = "Additional tags applied to all resources."
  type        = map(string)
  default     = {}
}
