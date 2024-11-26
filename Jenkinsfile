pipeline {
    agent any
    environment {
        DOCKER_REPO = 'boytur/k8s-docker-stagging-env'
        IMAGE_TAG = "${env.BRANCH_NAME ?: 'latest'}-${env.GIT_COMMIT ?: 'unknown'}"
        GITHUB_CONTEXT = "continuous-integration/jenkins" // Set custom GitHub check context
    }
    stages {
        stage('Checkout') {
            steps {
                script {
                    githubNotify(context: 'Checkout', status: 'PENDING', description: 'Checking out the code...')
                }
                // Checkout the repository
                git branch: "${env.BRANCH_NAME}", url: 'https://github.com/boytur/jenkins-docker-k8s.git'
                script {
                    githubNotify(context: 'Checkout', status: 'SUCCESS', description: 'Code checked out successfully.')
                }
            }
        }
        stage('Lint Code') {
            steps {
                script {
                    githubNotify(context: 'Lint', status: 'PENDING', description: 'Linting the code...')
                    try {
                        // Lint the codebase
                        sh 'npm run lint'
                        githubNotify(context: 'Lint', status: 'SUCCESS', description: 'Linting completed successfully.')
                    } catch (e) {
                        githubNotify(context: 'Lint', status: 'FAILURE', description: 'Linting failed.')
                        error 'Linting failed.'
                    }
                }
            }
        }
        stage('Run Unit Tests') {
            steps {
                script {
                    githubNotify(context: 'Unit Tests', status: 'PENDING', description: 'Running unit tests...')
                    try {
                        // Run unit tests
                        sh 'npm test'
                        githubNotify(context: 'Unit Tests', status: 'SUCCESS', description: 'Unit tests passed.')
                    } catch (e) {
                        githubNotify(context: 'Unit Tests', status: 'FAILURE', description: 'Unit tests failed.')
                        error 'Unit tests failed.'
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    githubNotify(context: 'Docker Build', status: 'PENDING', description: 'Building the Docker image...')
                    try {
                        // Build the Docker image locally
                        sh "docker build -t ${DOCKER_REPO}:${IMAGE_TAG} ."
                        githubNotify(context: 'Docker Build', status: 'SUCCESS', description: 'Docker image built successfully.')
                    } catch (e) {
                        githubNotify(context: 'Docker Build', status: 'FAILURE', description: 'Docker build failed.')
                        error 'Docker build failed.'
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                echo "Pipeline completed. Check GitHub for status updates."
            }
        }
    }
}
