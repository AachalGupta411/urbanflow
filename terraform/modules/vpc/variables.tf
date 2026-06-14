variable "project_name" {
  description = "Project name used as a prefix for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
}

variable "availability_zones" {
  description = "Availability zones for subnet placement."
  type        = list(string)
}

variable "single_nat_gateway" {
  description = "Use a single NAT gateway instead of one per AZ."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for VPC resources."
  type        = map(string)
  default     = {}
}
