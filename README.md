# Sustainable Resource Optimizer 🌍☁️

A production-ready multi-cloud SaaS platform for tracking resource usage, calculating carbon emissions, and optimizing cloud costs using AI.

## 🚀 Features
- **Multi-Cloud Dashboard**: Connect AWS, Azure, and GCP.
- **Real-time Carbon Tracking**: CO2 = kWh × carbon intensity.
- **AI Optimization**: XGBoost models to identify idle/over-provisioned resources.
- **ESG Reports**: Generate professional PDF reports with Puppeteer.
- **Automation**: Lambda workflows to stop idle instances.
- **Multi-tenant**: Secure isolation using AWS Cognito and DynamoDB.

## ⚙️ Tech Stack
- **Frontend**: React + Vite + TailwindCSS + Recharts.
- **Backend**: Node.js (Express).
- **Cloud**: AWS (Cognito, DynamoDB, Lambda, S3, Cost Explorer).
- **ML**: XGBoost (Synthetic training data).
- **Infra**: Terraform.

## 🛠️ Setup Guide

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env with your AWS credentials and Cognito IDs
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Configure .env with VITE_COGNITO IDs
npm run dev
```

### 3. ML Training
```bash
cd ml
pip install -r requirements.txt
python train_model.py
```

## 📐 System Design for Interviews
- **Tenant Isolation**: Each user is assigned a `tenant_id` in Cognito, which is used as the Partition Key in DynamoDB.
- **Stateless Emission Engine**: Uses regional grid intensity factors (e.g., India 0.72 vs EU 0.28) to ensure accurate reporting.
- **ML Pipeline**: Synthetic data mimics real cloud usage patterns (CPU, Uptime, Cost) to train an XGBoost classifier for proactive cost saving.

## 📄 License
MIT License