# Jenkins Setup Guide – UrbanFlow

## Prerequisites

- AWS EC2 instance (t3.medium recommended) provisioned via Terraform `ec2-jenkins` module
- Security group allowing ports 22 (SSH), 8080 (Jenkins), 50000 (agent)
- IAM role with ECR push and EKS deploy permissions

## Installation (Automated via Terraform)

The `terraform/modules/ec2-jenkins/user-data.sh` script installs:

- Docker CE
- AWS CLI v2
- kubectl (matching EKS version)
- Helm 3
- Trivy scanner
- Jenkins LTS with plugins: pipeline, git, docker, credentials

After `terraform apply`:

```bash
terraform output jenkins_url
terraform output -raw jenkins_admin_password
```

## Manual Installation (Alternative)

```bash
# Ubuntu 22.04
sudo apt update && sudo apt install -y openjdk-17-jdk docker.io
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list
sudo apt update && sudo apt install -y jenkins
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Install Trivy:

```bash
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

## Pipeline Job Configuration

1. Open Jenkins → **New Item** → **Pipeline**
2. Name: `urbanflow-pipeline`
3. **Pipeline** → Definition: **Pipeline script from SCM**
4. SCM: Git, Repository URL: your UrbanFlow repo
5. Script Path: `Jenkinsfile`
6. Save and **Build Now**

## Required Tools on Jenkins Agent

| Tool | Purpose | Verify |
|------|---------|--------|
| Docker | Build images | `docker --version` |
| Trivy | Security scan | `trivy --version` |
| kubectl | K8s deploy | `kubectl version --client` |
| AWS CLI | ECR login | `aws --version` |
| Node.js 20 | Tests | `node --version` |

## Webhook Trigger (Optional)

Configure GitHub/GitLab webhook:

- URL: `http://<jenkins-ip>:8080/github-webhook/`
- Events: Push to `main`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Docker permission denied | `sudo usermod -aG docker jenkins && restart jenkins` |
| Trivy not found | Install to `/usr/local/bin`, ensure in PATH |
| kubectl context wrong | Run `aws eks update-kubeconfig --name urbanflow-dev` |
| ECR login fails | Verify IAM credentials in Jenkins |

See [credentials-guide.md](credentials-guide.md) for credential setup.
