provider "aws" {
  region = "ap-south-1"
}

# 1. Cognito User Pool
resource "aws_cognito_user_pool" "pool" {
  name = "sustainable-optimizer-pool"

  alias_attributes         = ["email"]
  auto_verified_attributes = ["email"]

  schema {
    attribute_data_type = "String"
    name                = "tenant_id"
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "role"
    mutable             = true
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "web-client"
  user_pool_id = aws_cognito_user_pool.pool.id
}

# 2. DynamoDB Table for Users/Tenants
resource "aws_dynamodb_table" "users" {
  name           = "Users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "tenant_id"

  attribute {
    name = "tenant_id"
    type = "S"
  }

  tags = {
    Environment = "Production"
    Project     = "Sustainable Resource Optimizer"
  }
}

# 3. IAM Role for Cloud Integration (AssumeRole)
resource "aws_iam_role" "customer_access_role" {
  name = "SgpOptimizerAccessRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}
