pipeline {
    agent any
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_REPO = 'boytur/k8s-docker-stagging-env'
        IMAGE_TAG = "${env.BRANCH_NAME ?: 'latest'}-${env.GIT_COMMIT ?: 'unknown'}"
        REGISTRY_CREDENTIALS = 'dockerhub-credentials-id'
        K8S_NAMESPACE = 'default'
        REPLICAS = '1'
        PROD_REPLICAS = '3'
        CONTAINER_PORT = '3834'
        SERVICE_PORT = '80'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/boytur/jenkins-docker-k8s.git'
            }
        }
        stage('Login to Docker Registry') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${REGISTRY_CREDENTIALS}") {
                        echo "Successfully logged in to Docker registry"
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_REPO}:${IMAGE_TAG} ."
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:${IMAGE_TAG}"
                }
            }
        }
        stage('Check Kubernetes Context') {
            steps {
                script {
                    // Ensure kubectl is connected to the correct Kubernetes cluster
                    sh 'kubectl config current-context'
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    def replicas = (env.BRANCH_NAME == 'main') ? PROD_REPLICAS : REPLICAS
                    sh """
                    kubectl apply -f - <<EOF
                    apiVersion: apps/v1
                    kind: Deployment
                    metadata:
                      name: ${DOCKER_REPO}-${IMAGE_TAG}
                      labels:
                        app: ${DOCKER_REPO}
                    spec:
                      replicas: ${replicas}
                      selector:
                        matchLabels:
                          app: ${DOCKER_REPO}
                          version: ${IMAGE_TAG}
                      template:
                        metadata:
                          labels:
                            app: ${DOCKER_REPO}
                            version: ${IMAGE_TAG}
                        spec:
                          containers:
                          - name: ${DOCKER_REPO}
                            image: ${DOCKER_REGISTRY}/${DOCKER_REPO}:${IMAGE_TAG}
                            ports:
                            - containerPort: ${CONTAINER_PORT}
                    ---
                    apiVersion: v1
                    kind: Service
                    metadata:
                      name: ${DOCKER_REPO}-${IMAGE_TAG}-service
                    spec:
                      type: LoadBalancer
                      selector:
                        app: ${DOCKER_REPO}
                        version: ${IMAGE_TAG}
                      ports:
                      - protocol: TCP
                        port: ${SERVICE_PORT}
                        targetPort: ${CONTAINER_PORT}
                    EOF
                    """
                }
            }
        }
    }
    post {
        always {
            script {
                if (env.BRANCH_NAME != 'main') {
                    echo "Preview Environment URL: http://${DOCKER_REPO}-${IMAGE_TAG}-service.${K8S_NAMESPACE}.svc.cluster.local/"
                } else {
                    echo "Production deployed successfully!"
                }
            }
        }
    }
}
