#!/bin/bash
set -euo pipefail

exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

PROJECT_NAME="${project_name}"
ENVIRONMENT="${environment}"
AWS_REGION="${aws_region}"
CLUSTER_NAME="${cluster_name}"
JENKINS_ADMIN_PASSWORD="${jenkins_admin_password}"

echo "=== UrbanFlow Jenkins bootstrap starting ==="

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get upgrade -y

apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  software-properties-common \
  unzip \
  jq \
  git \
  fontconfig \
  openjdk-17-jre

# Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# AWS CLI v2
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# kubectl
KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt)
curl -fsSLo /usr/local/bin/kubectl "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
chmod +x /usr/local/bin/kubectl

# Helm
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Jenkins LTS
wget -q -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
  > /etc/apt/sources.list.d/jenkins.list
apt-get update -y
apt-get install -y jenkins

systemctl enable jenkins
systemctl start jenkins

# Configure kubectl for the EKS cluster
mkdir -p /var/lib/jenkins/.kube
aws eks update-kubeconfig --region "${AWS_REGION}" --name "${CLUSTER_NAME}" --kubeconfig /var/lib/jenkins/.kube/config
chown -R jenkins:jenkins /var/lib/jenkins/.kube
chmod 600 /var/lib/jenkins/.kube/config

# Install Jenkins plugins and create admin user via Groovy init script
mkdir -p /var/lib/jenkins/init.groovy.d
cat > /var/lib/jenkins/init.groovy.d/01-admin-user.groovy <<'GROOVY'
import jenkins.model.*
import hudson.security.*

def instance = Jenkins.getInstance()
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount(System.getenv('JENKINS_ADMIN_USER'), System.getenv('JENKINS_ADMIN_PASSWORD'))
instance.setSecurityRealm(hudsonRealm)
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)
instance.save()
GROOVY

cat > /var/lib/jenkins/init.groovy.d/02-install-plugins.groovy <<'GROOVY'
import jenkins.model.*
import java.util.logging.Logger

def logger = Logger.getLogger('urbanflow-plugins')
def plugins = [
  'workflow-aggregator',
  'git',
  'docker-workflow',
  'kubernetes-cli',
  'blueocean',
  'pipeline-stage-view',
  'credentials-binding',
  'amazon-ecr',
  'aws-credentials'
]

def pm = Jenkins.instance.pluginManager
def uc = Jenkins.instance.updateCenter
uc.updateAllSites()
plugins.each { plugin ->
  if (!pm.getPlugin(plugin)) {
    def installation = uc.getPlugin(plugin)?.deploy()
    while (!installation?.isDone()) {
      Thread.sleep(1000)
    }
    logger.info("Installed plugin: ${plugin}")
  }
}
Jenkins.instance.save()
GROOVY

chown -R jenkins:jenkins /var/lib/jenkins/init.groovy.d

cat > /etc/default/jenkins <<EOF
JENKINS_ARGS="--httpPort=8080"
JAVA_ARGS="-Djenkins.install.runSetupWizard=false"
JENKINS_USER=jenkins
JENKINS_HOME=/var/lib/jenkins
EOF

export JENKINS_ADMIN_USER="admin"
export JENKINS_ADMIN_PASSWORD="${JENKINS_ADMIN_PASSWORD}"

systemctl restart jenkins

# Trivy for pipeline security scanning
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
ln -sf /usr/local/bin/trivy /usr/bin/trivy

# UrbanFlow marker file
cat > /etc/urbanflow-jenkins.conf <<EOF
PROJECT_NAME=${PROJECT_NAME}
ENVIRONMENT=${ENVIRONMENT}
CLUSTER_NAME=${CLUSTER_NAME}
AWS_REGION=${AWS_REGION}
BOOTSTRAP_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

echo "=== UrbanFlow Jenkins bootstrap complete ==="
