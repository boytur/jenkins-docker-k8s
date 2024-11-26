pipeline {
    agent any
    environment {
        // Docker Registry and Image Details
        DOCKER_REGISTRY = 'docker.io' // Use your Docker registry, e.g. docker.io for Docker Hub or your custom registry URL
        DOCKER_REPO = 'boytur/k8s-docker-stagging-env' // Replace with your Docker image repository
        IMAGE_TAG = "${env.BRANCH_NAME}-${env.CHANGE_ID}" // Tag format based on branch name and PR ID

        // Credentials for Docker registry
        REGISTRY_CREDENTIALS = 'dockerhub-credentials-id' // Jenkins credentials ID for Docker login

        // Kubernetes deploymenst settings
        K8S_NAMESPACE = 'default' // Kubernetes namespace to deploy to
        REPLICAS = '1' // Default replica count for staging (PR), adjust as needed
        PROD_REPLICAS = '3' // Default replica count for production
        CONTAINER_PORT = '3834' // The port your container listens on
        SERVICE_PORT = '80' // Port exposed by the Kubernetes service
    }
    stages {
        stage('Login to Docker Registry') {
            steps {
                script {
                    // Log in to Docker registry using Jenkins credentials
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${REGISTRY_CREDENTIALS}") {
                        echo "Successfully logged in to Docker registry"
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    sh """
                    docker build -t ${DOCKER_REGISTRY}/${DOCKER_REPO}:${IMAGE_TAG} .
                    """
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    // Push the Docker image to the registry
                    sh """
                    docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:${IMAGE_TAG}
                    """
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Conditional Deployment to Production or Staging
                    def replicas = (env.BRANCH_NAME == 'main') ? PROD_REPLICAS : REPLICAS

                    // Deploy to Kubernetes with dynamic replicas and image tag
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
                // Display the Preview URL if not deploying to Production
                if (env.BRANCH_NAME != 'main') {
                    echo "Preview Environment URL: http://${DOCKER_REPO}-${IMAGE_TAG}-service.${K8S_NAMESPACE}.svc.cluster.local/"
                } else {
                    echo "Production deployed successfully!"
                }
            }
        }
    }
}
