terraform {
  backend "s3" {
    bucket         = "urbanflow-terraform-state-dev"
    key            = "urbanflow/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "urbanflow-terraform-locks"
    encrypt        = true
  }
}
