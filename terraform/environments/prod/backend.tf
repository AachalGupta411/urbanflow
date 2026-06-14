terraform {
  backend "s3" {
    bucket         = "urbanflow-terraform-state-prod"
    key            = "urbanflow/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "urbanflow-terraform-locks"
    encrypt        = true
  }
}
