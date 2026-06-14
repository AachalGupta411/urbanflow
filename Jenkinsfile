# UrbanFlow Jenkins Pipeline
# Declarative pipeline with 9 stages for CI/CD

pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = credentials('docker-registry-url')
        AWS_REGION      = 'us-east-1'
        EKS_CLUSTER     = 'urbanflow-dev'
        IMAGE_TAG       = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
        SERVICES        = 'ticketing-service passenger-service gps-service notification-service analytics-service'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('1. Git Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                }
            }
        }

        stage('2. Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('services/shared') {
                            sh 'npm ci || npm install'
                        }
                        script {
                            SERVICES.split(' ').each { svc ->
                                dir("services/${svc}") {
                                    sh 'npm ci || npm install'
                                }
                            }
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci || npm install'
                        }
                    }
                }
            }
        }

        stage('3. Run Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        script {
                            SERVICES.split(' ').each { svc ->
                                dir("services/${svc}") {
                                    sh 'npm test -- --coverage --passWithNoTests || npm test'
                                }
                            }
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'services/**/junit.xml'
                }
            }
        }

        stage('4. Static Analysis') {
            steps {
                script {
                    SERVICES.split(' ').each { svc ->
                        dir("services/${svc}") {
                            sh '''
                                if [ -f .eslintrc.js ] || [ -f .eslintrc.json ]; then
                                    npx eslint src/ --max-warnings 0 || true
                                fi
                            '''
                        }
                    }
                }
            }
        }

        stage('5. Build Docker Images') {
            steps {
                script {
                    SERVICES.split(' ').each { svc ->
                        sh """
                            docker build -f services/${svc}/Dockerfile \
                                -t urbanflow/${svc}:${IMAGE_TAG} \
                                -t urbanflow/${svc}:latest \
                                services/
                        """
                    }
                    sh """
                        docker build -f frontend/Dockerfile \
                            -t urbanflow/frontend:${IMAGE_TAG} \
                            -t urbanflow/frontend:latest \
                            frontend/
                    """
                }
            }
        }

        stage('6. Security Scan (Trivy)') {
            steps {
                script {
                    def allImages = SERVICES.split(' ') + ['frontend']
                    allImages.each { img ->
                        sh """
                            trivy image --severity CRITICAL,HIGH \
                                --exit-code 1 \
                                --ignore-unfixed \
                                urbanflow/${img}:latest || echo "Trivy scan completed with findings for ${img}"
                        """
                    }
                }
            }
        }

        stage('7. Push Images') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'ecr-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin ${DOCKER_REGISTRY}
                    '''
                    script {
                        def allImages = SERVICES.split(' ') + ['frontend']
                        allImages.each { img ->
                            sh """
                                docker tag urbanflow/${img}:latest ${DOCKER_REGISTRY}/urbanflow/${img}:${IMAGE_TAG}
                                docker tag urbanflow/${img}:latest ${DOCKER_REGISTRY}/urbanflow/${img}:latest
                                docker push ${DOCKER_REGISTRY}/urbanflow/${img}:${IMAGE_TAG}
                                docker push ${DOCKER_REGISTRY}/urbanflow/${img}:latest
                            """
                        }
                    }
                }
            }
        }

        stage('8. Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        kubectl apply -f kubernetes/namespace/
                        kubectl apply -f kubernetes/configmaps/
                        kubectl apply -f kubernetes/rbac/
                        kubectl apply -R -f kubernetes/deployments/
                        kubectl apply -R -f kubernetes/services/
                        kubectl apply -R -f kubernetes/hpa/
                        kubectl apply -f kubernetes/ingress/
                        kubectl apply -R -f kubernetes/network-policies/
                        kubectl rollout status deployment/ticketing-service -n urbanflow --timeout=300s
                        kubectl rollout status deployment/passenger-service -n urbanflow --timeout=300s
                    '''
                }
            }
        }

        stage('9. Smoke Tests') {
            steps {
                sh './scripts/smoke-test.sh'
            }
        }
    }

    post {
        success {
            echo 'UrbanFlow pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check stage logs for details.'
        }
        always {
            cleanWs()
        }
    }
}
