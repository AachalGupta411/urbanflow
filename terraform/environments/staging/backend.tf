terraform {
  backend "s3" {
    bucket         = "urbanflow-terraform-state-staging"
    key            = "urbanflow/staging/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "urbanflow-terraform-locks"
    encrypt        = true
  }
}
