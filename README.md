<div align="center">
<h1 style="color: red;"><strong>NOTE: Frontend Repository</strong></h1>
<p><strong>The Frontend code for this application is in a separate repository. You can find it here:<br><a href="https://github.com/SurjeetKumar1/Linkify-frontend">https://github.com/SurjeetKumar1/Linkify-frontend</a></strong></p>
</div>

---

# **Backend CI/CD Pipeline: AWS EC2 & GitHub Actions 🚀**

<br>
<p align="center">
  <img src="https://github.com/SurjeetKumar1/Linkify-Backend/blob/main/assets/backend-output.png" alt="Live API Endpoint" width="75%"/>
</p>

This repository outlines the complete process for setting up an automated **CI/CD** (Continuous Integration/Continuous Deployment) pipeline for a Node.js backend. The pipeline uses **GitHub Actions** to automatically build and deploy the latest changes from the `main` branch to an **AWS EC2 instance**, where the application is managed by **PM2**.

---

## **Table of Contents**

- [Features](#features-)
- [Architecture Overview](#architecture-overview-)
- [Setup Instructions](#setup-instructions-)
  - [1. AWS EC2 Instance Setup](#1-aws-ec2-instance-setup-)
  - [2. GitHub Actions Self-Hosted Runner](#2-github-actions-self-hosted-runner-setup-)
  - [3. GitHub Actions Workflow](#3-github-actions-workflow-configuration-)
- [Verification](#verification-)
- [Technology Stack](#technology-stack-)

---

## **Features ✨**

- **Automated Deployments:** Every push to the `main` branch automatically triggers a new deployment.
- **Zero Downtime:** PM2 ensures the application is always running, even if it crashes or the server reboots.
- **Robust & Scalable:** Built on AWS EC2, providing a reliable and scalable hosting environment.
- **Secure:** Uses SSH keys for server access and a self-hosted runner for secure communication between GitHub and AWS.
- **Environment Variable Management:** The workflow is designed to safely preserve your `.env` file on the server during deployments.

---

## **Architecture Overview 🏗️**

The pipeline follows these steps:
1.  A developer pushes code to the `main` branch on GitHub.
2.  The push event triggers a GitHub Actions workflow.
3.  GitHub Actions assigns the job to a self-hosted runner configured on the AWS EC2 instance.
4.  The runner on the EC2 instance checks out the latest code, installs dependencies, and builds the application.
5.  PM2 restarts the Node.js application with the new code.

---

## **Setup Instructions 🛠️**

Follow these steps to replicate the setup.

### **1. AWS EC2 Instance Setup ☁️**

First, create and configure the cloud server.

1.  **Launch Instance:**
    -   In the AWS EC2 console, launch a new instance.
    -   **AMI:** `Ubuntu`
    -   **Instance Type:** `t2.micro` (Free Tier eligible)
    -   **Key Pair:** Create a new `.pem` key pair and download it.

2.  **Security Group (Firewall):** Configure inbound rules to allow:
    -   `SSH` (Port 22) from your IP.
    -   `HTTP` (Port 80) from `Anywhere` (0.0.0.0/0).
    -   `Custom TCP` (Port 9090 or your app's port) from `Anywhere` (0.0.0.0/0).

<p align="center">
  <img src="https://github.com/SurjeetKumar1/Linkify-Backend/blob/main/assets/ec2-machine.png" alt="EC2 Instance Configuration"/>
  <br><br>
  <img src="https://github.com/SurjeetKumar1/Linkify-Backend/blob/main/assets/port.png" alt="Security Group Port Configuration"/>
</p>

3.  **Connect and Prepare:**
    -   Secure your key:
      ```bash
      chmod 400 "linkify.pem"
      ```
    -   SSH into your instance:
      ```bash
      ssh -i "linkify.pem" ubuntu@ec2-52-90-197-220.compute-1.amazonaws.com
      ```
    -   Install necessary software:
      ```bash
      sudo apt update
      sudo apt install -y nodejs npm nginx
      sudo npm install -g pm2
      ```

### **2. GitHub Actions Self-Hosted Runner Setup 🏃‍♂️**

Connect your EC2 instance to your GitHub repository.

1.  In your GitHub repo, go to **Settings > Actions > Runners**.
2.  Click **"New self-hosted runner"** and select **Linux**.
3.  Follow the commands provided by GitHub on your EC2 instance.

    ```bash
    # Create a folder for the runner
    mkdir backend-runner && cd backend-runner

    # Download the runner package
    curl -o actions-runner-linux-x64-2.328.0.tar.gz -L [https://github.com/actions/runner/releases/download/v2.328.0/actions-runner-linux-x64-2.328.0.tar.gz](https://github.com/actions/runner/releases/download/v2.328.0/actions-runner-linux-x64-2.328.0.tar.gz)

    # Optional: Validate the hash
    echo "01066fad3a2893e63e6ca880ae3a1fad5bf9329d60e77ee15f2b97c148c3cd4e  actions-runner-linux-x64-2.328.0.tar.gz" | shasum -a 256 -c

    # Extract the installer
    tar xzf ./actions-runner-linux-x64-2.328.0.tar.gz

    # Configure the runner (use the URL and token from your repo's settings)
    ./config.sh --url [https://github.com/SurjeetKumar1/Linkify-Backend](https://github.com/SurjeetKumar1/Linkify-Backend) --token <YOUR_RUNNER_TOKEN>

    # Install the runner as a service to run on startup
    sudo ./svc.sh install

    # Start the runner service
    sudo ./svc.sh start
    ```

### **3. GitHub Actions Workflow Configuration ⚙️**

Create the automated deployment script.

1.  In your repository, create the file `.github/workflows/cicd.yml`.
2.  Paste the following configuration:

    ```yaml
    name: Linkify-Backend CI

    on:
      push:
        branches: [ "main" ]

    jobs:
      build:
        runs-on: self-hosted
        strategy:
          matrix:
            node-version: [23.x]

        steps:
        - name: Backup .env
          run: |
            if [ -f .env ]; then mv .env $HOME/env_backup; fi

        - uses: actions/checkout@v4

        - name: Restore .env
          run: |
            if [ -f $HOME/env_backup ]; then mv $HOME/env_backup .env; fi

        - name: Use Node.js ${{ matrix.node-version }}
          uses: actions/setup-node@v4
          with:
            node-version: ${{ matrix.node-version }}
            cache: 'npm'

        - run: npm ci
        - run: npm run build --if-present
        - run: sudo pm2 restart backend
    ```
<p align="center">
  <img src="https://github.com/SurjeetKumar1/Linkify-Backend/blob/main/assets/backend-workflow.png" alt="CI/CD Build Workflow"/>
  <br><br>
  <img src="https://github.com/SurjeetKumar1/Linkify-Backend/blob/main/assets/backend-command.png" alt="Runner Setup Commands"/>
</p>

#### **Handling the `.env` file**
The workflow is designed to preserve your `.env` file on the server. You must create this file manually the first time.

1.  SSH into your EC2 instance.
2.  Navigate to your runner's working directory, e.g., `cd ~/backend-runner/_work/your-repo-name/your-repo-name`.
3.  Create and add your secrets to the `.env` file.
    ```bash
    nano .env
    ```

---

#### Start app (as ubuntu user, no sudo)
pm2 start server.js --name backend

#### Restart app
pm2 restart backend

#### See running apps
pm2 list

#### Save processes (so they survive reboot)
pm2 save

---

## **Verification ✅**

After pushing a change to the `main` branch, the GitHub Action will automatically trigger. You can verify a successful deployment by accessing your API endpoint.

**Example Endpoint:** `https://ec2-54-86-19-8.compute-1.amazonaws.com:9090/test`

<p align="center">
  <img src="https://github.com/SurjeetKumar1/Linkify-Backend/blob/main/assets/backend-output.png" alt="Live Backend Response"/>
</p>

---

## **Technology Stack 💻**

-   **Cloud Provider:** [Amazon Web Services (AWS)](https://aws.amazon.com/)
-   **CI/CD:** [GitHub Actions](https://github.com/features/actions)
-   **Compute:** [AWS EC2](https://aws.amazon.com/ec2/)
-   **Runtime:** [Node.js](https://nodejs.org/)
-   **Process Manager:** [PM2](https://pm2.keymetrics.io/)
-   **Web Server / Reverse Proxy:** [Nginx](https://www.nginx.com/)
-   **Operating System:** [Ubuntu](https://ubuntu.com/)

---
