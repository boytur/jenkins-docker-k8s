pipeline {
    agent any
    environment {
        IMAGE_TAG = "${env.BRANCH_NAME ?: 'latest'}-${env.GIT_COMMIT ?: 'unknown'}"
    }
    stages {
        stage('Checkout') {
            steps {
                // Checkout the code for the current branch
                git branch: "${env.BRANCH_NAME}", url: 'https://github.com/boytur/jenkins-docker-k8s.git'
            }
        }
        stage('Display Branch Name') {
            steps {
                script {
                    // Build the Docker image
                    sh "echo 'Branch Name: ${env.BRANCH_NAME}'"
                }
            }
        }
    }
    post {
        always {
            script {
                // Print the Docker image tag built
                echo "Docker image built locally: ${DOCKER_REPO}:${IMAGE_TAG}"
                if (env.BRANCH_NAME != 'main') {
                    echo "Preview environment for branch ${env.BRANCH_NAME} built successfully!"
                } else {
                    echo "Production image for branch ${env.BRANCH_NAME} built successfully!"
                }
            }
        }
    }
}
