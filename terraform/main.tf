locals {
  cluster_name = "${var.project_name}-${var.environment}-eks"

  backup_bucket_name = var.backup_bucket_name != "" ? var.backup_bucket_name : "${var.project_name}-${var.environment}-backups-${data.aws_caller_identity.current.account_id}"

  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
  })
}

data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------------------
# Networking
# ---------------------------------------------------------------------------

module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  single_nat_gateway = var.single_nat_gateway
  tags               = local.common_tags
}

module "security_groups" {
  source = "./modules/security-groups"

  project_name                   = var.project_name
  environment                    = var.environment
  vpc_id                         = module.vpc.vpc_id
  vpc_cidr_block                 = module.vpc.vpc_cidr_block
  jenkins_allowed_cidr_blocks    = var.jenkins_allowed_cidr_blocks
  monitoring_allowed_cidr_blocks = var.monitoring_allowed_cidr_blocks
  tags                           = local.common_tags
}

# ---------------------------------------------------------------------------
# S3 Backup Bucket
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "backups" {
  bucket = local.backup_bucket_name

  tags = merge(local.common_tags, {
    Name = local.backup_bucket_name
    Role = "mysql-backups"
  })
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "expire-old-backups"
    status = "Enabled"

    filter {
      prefix = "mysql/"
    }

    expiration {
      days = var.backup_retention_days
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}

# ---------------------------------------------------------------------------
# IAM
# ---------------------------------------------------------------------------

module "iam" {
  source = "./modules/iam"

  project_name      = var.project_name
  environment       = var.environment
  backup_bucket_arn = aws_s3_bucket.backups.arn
  eks_cluster_name  = local.cluster_name
  tags              = local.common_tags
}

# ---------------------------------------------------------------------------
# EKS
# ---------------------------------------------------------------------------

module "eks" {
  source = "./modules/eks"

  project_name                            = var.project_name
  environment                             = var.environment
  cluster_name                            = local.cluster_name
  kubernetes_version                      = var.kubernetes_version
  vpc_id                                  = module.vpc.vpc_id
  private_subnet_ids                      = module.vpc.private_subnet_ids
  cluster_security_group_id               = module.security_groups.eks_cluster_security_group_id
  node_security_group_id                  = module.security_groups.eks_nodes_security_group_id
  cluster_role_arn                        = module.iam.eks_cluster_role_arn
  node_role_arn                           = module.iam.eks_node_role_arn
  node_instance_types                     = var.eks_node_instance_types
  node_desired_size                       = var.eks_node_desired_size
  node_min_size                           = var.eks_node_min_size
  node_max_size                           = var.eks_node_max_size
  node_disk_size                          = var.eks_node_disk_size
  enable_cluster_endpoint_public_access   = var.enable_cluster_endpoint_public_access
  enable_cluster_endpoint_private_access  = var.enable_cluster_endpoint_private_access
  tags                                    = local.common_tags
}

# ---------------------------------------------------------------------------
# S3 Backup IAM Role (IRSA for Kubernetes CronJob)
# ---------------------------------------------------------------------------

resource "aws_iam_role" "s3_backup" {
  name = "${var.project_name}-${var.environment}-s3-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = module.eks.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(module.eks.oidc_issuer_url, "https://", "")}:aud" = "sts.amazonaws.com"
            "${replace(module.eks.oidc_issuer_url, "https://", "")}:sub" = "system:serviceaccount:urbanflow:mysql-backup"
          }
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-s3-backup-role"
  })
}

resource "aws_iam_role_policy" "s3_backup" {
  name = "${var.project_name}-${var.environment}-s3-backup-policy"
  role = aws_iam_role.s3_backup.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BackupWrite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = [
          aws_s3_bucket.backups.arn,
          "${aws_s3_bucket.backups.arn}/*"
        ]
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# Jenkins CI/CD
# ---------------------------------------------------------------------------

resource "random_password" "jenkins_admin" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}"
}

module "ec2_jenkins" {
  source = "./modules/ec2-jenkins"

  project_name           = var.project_name
  environment            = var.environment
  aws_region             = var.aws_region
  cluster_name           = local.cluster_name
  subnet_id              = module.vpc.public_subnet_ids[0]
  security_group_id      = module.security_groups.jenkins_security_group_id
  instance_profile_name  = module.iam.jenkins_instance_profile_name
  instance_type          = var.jenkins_instance_type
  volume_size            = var.jenkins_volume_size
  key_name               = var.jenkins_key_name
  jenkins_admin_password = random_password.jenkins_admin.result
  associate_public_ip    = true
  tags                   = local.common_tags

  depends_on = [module.eks]
}

# ---------------------------------------------------------------------------
# Monitoring (Prometheus)
# ---------------------------------------------------------------------------

module "monitoring" {
  source = "./modules/monitoring"

  project_name    = var.project_name
  environment     = var.environment
  subnet_id       = module.vpc.public_subnet_ids[1]
  security_group_id = module.security_groups.monitoring_security_group_id
  vpc_cidr_block  = module.vpc.vpc_cidr_block
  instance_type   = var.monitoring_instance_type
  volume_size     = var.monitoring_volume_size
  key_name        = var.monitoring_key_name
  eks_cluster_name = local.cluster_name
  tags            = local.common_tags
}
