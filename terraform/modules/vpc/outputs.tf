output "vpc_id" {
  description = "ID of the UrbanFlow VPC."
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the UrbanFlow VPC."
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of private subnets."
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "IDs of database subnets."
  value       = aws_subnet.database[*].id
}

output "database_subnet_group_name" {
  description = "Name of the RDS DB subnet group."
  value       = aws_db_subnet_group.main.name
}

output "nat_gateway_ids" {
  description = "IDs of NAT gateways."
  value       = aws_nat_gateway.main[*].id
}

output "internet_gateway_id" {
  description = "ID of the internet gateway."
  value       = aws_internet_gateway.main.id
}

output "availability_zones" {
  description = "Availability zones used by the VPC module."
  value       = var.availability_zones
}
