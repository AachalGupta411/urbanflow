# Jenkins Credentials Configuration – UrbanFlow

## Required Credentials

Configure these in Jenkins → **Manage Jenkins** → **Credentials** → **System** → **Global credentials**.

### 1. ECR / AWS Credentials

| Field | Value |
|-------|-------|
| Kind | Username with password |
| ID | `ecr-credentials` |
| Username | AWS Access Key ID |
| Password | AWS Secret Access Key |

**Scope**: Global. Used in pipeline stage 7 for ECR login.

### 2. Docker Registry URL

| Field | Value |
|-------|-------|
| Kind | Secret text |
| ID | `docker-registry-url` |
| Secret | `123456789012.dkr.ecr.us-east-1.amazonaws.com` |

Replace with your AWS account ID and region.

### 3. Kubernetes Config

| Field | Value |
|-------|-------|
| Kind | Secret file |
| ID | `kubeconfig` |
| File | Upload `~/.kube/config` for EKS cluster |

Generate kubeconfig:

```bash
aws eks update-kubeconfig --name urbanflow-dev --region us-east-1
```

### 4. Git Credentials (if private repo)

| Field | Value |
|-------|-------|
| Kind | Username with password / SSH key |
| ID | `git-credentials` |

## IAM Policy for Jenkins Role

Minimum permissions for the Jenkins EC2 IAM role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["eks:DescribeCluster"],
      "Resource": "*"
    }
  ]
}
```

## Environment Variables in Jenkins

Set under **Manage Jenkins** → **System** → **Global properties**:

| Variable | Example |
|----------|---------|
| `AWS_REGION` | `us-east-1` |
| `EKS_CLUSTER` | `urbanflow-dev` |

## Security Best Practices

- Rotate AWS access keys every 90 days
- Use IAM roles for EC2 instead of long-lived keys when possible
- Restrict Jenkins UI access to VPN/office CIDR
- Never commit credentials to Git — use K8s Secrets and Jenkins credentials store
- Enable Jenkins audit log plugin for compliance

## Verification

After configuring credentials, run a test pipeline build. Stages 1–6 should pass on any branch; stages 7–8 require `main` branch and valid AWS/K8s credentials.
