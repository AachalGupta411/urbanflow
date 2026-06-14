terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "UrbanFlow"
      Environment = "dev"
      ManagedBy   = "Terraform"
    }
  }
}

module "urbanflow" {
  source = "../.."

  aws_region         = var.aws_region
  environment        = "dev"
  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  single_nat_gateway = var.single_nat_gateway

  kubernetes_version      = var.kubernetes_version
  eks_node_instance_types = var.eks_node_instance_types
  eks_node_desired_size   = var.eks_node_desired_size
  eks_node_min_size       = var.eks_node_min_size
  eks_node_max_size       = var.eks_node_max_size
  eks_node_disk_size      = var.eks_node_disk_size

  jenkins_instance_type         = var.jenkins_instance_type
  jenkins_volume_size           = var.jenkins_volume_size
  jenkins_key_name              = var.jenkins_key_name
  jenkins_allowed_cidr_blocks   = var.jenkins_allowed_cidr_blocks

  monitoring_instance_type         = var.monitoring_instance_type
  monitoring_volume_size           = var.monitoring_volume_size
  monitoring_key_name              = var.monitoring_key_name
  monitoring_allowed_cidr_blocks = var.monitoring_allowed_cidr_blocks

  backup_bucket_name    = var.backup_bucket_name
  backup_retention_days = var.backup_retention_days

  enable_cluster_endpoint_public_access  = var.enable_cluster_endpoint_public_access
  enable_cluster_endpoint_private_access = var.enable_cluster_endpoint_private_access

  tags = var.tags
}

output "vpc_id" {
  description = "ID of the UrbanFlow VPC."
  value       = module.urbanflow.vpc_id
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster."
  value       = module.urbanflow.eks_cluster_name
}

output "eks_cluster_endpoint" {
  description = "Endpoint URL for the EKS Kubernetes API server."
  value       = module.urbanflow.eks_cluster_endpoint
}

output "jenkins_public_ip" {
  description = "Public IP address of the Jenkins EC2 instance."
  value       = module.urbanflow.jenkins_public_ip
}

output "jenkins_url" {
  description = "URL to access the Jenkins web UI."
  value       = module.urbanflow.jenkins_url
}

output "prometheus_url" {
  description = "URL to access the Prometheus web UI."
  value       = module.urbanflow.prometheus_url
}

output "backup_bucket_name" {
  description = "Name of the S3 backup bucket."
  value       = module.urbanflow.backup_bucket_name
}
