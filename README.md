# 🏥 Digital Health Wallet

An AI-powered Full-Stack Health Management System designed to bridge the gap between physical medical reports and digital health tracking.



## 📝 Project Overview

### The Problem
Patients often struggle to maintain a longitudinal history of their health data. Medical reports are frequently stored in physical formats or fragmented PDFs, making it difficult to track vital trends like Blood Pressure and Sugar levels over time or share them securely with doctors and family members.

### The Solution
The **Digital Health Wallet** provides a centralized platform where users can:
* **Digitize Reports**: Upload images of medical reports and use AI-OCR (Optical Character Recognition) to automatically extract vital signs.
* **Visualize Trends**: Track health progress through interactive charts that highlight fluctuations in Systolic, Diastolic, and Sugar levels.
* **Secure Access Control**: Share specific reports with family members or healthcare providers using a role-based permission system.

---

## ⚙️ How it Works (The Process)



1.  **Authentication**: Users register as a **Patient** or a **Viewer**. Passwords are hashed for security, and sessions are managed via JSON Web Tokens (JWT).
2.  **OCR Extraction**: When a patient uploads a report, the backend utilizes the **Tesseract.js** engine to "read" the document and extract numerical vitals using Regex patterns.
3.  **Data Storage**: Extracted vitals and file metadata are stored in a relational SQLite database.
4.  **Role-Based UI**: 
    * **Patients**: Manage their records (Upload, View, Share, Delete).
    * **Viewers**: Search for a Patient ID to access health trends and files in a "Read-Only" mode.

---

## 🛠️ Tech Stack



### Frontend
* **React (Vite)**: Modern UI development.
* **Recharts**: Interactive health trend visualization.
* **Axios**: Secure API communication.
* **Lucide-React**: Clean, professional iconography.

### Backend
* **Node.js & Express**: Scalable backend architecture.
* **Tesseract.js**: AI-OCR for automated data extraction.
* **SQLite3**: Lightweight relational database for records and permissions.
* **JWT & Bcrypt**: Security and Authentication protocols.
* **Multer**: Middleware for handling file uploads.

---

## 🚀 Setup & Installation

Follow these steps to run the project on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (LTS Version)
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/digital-health-wallet.git](https://github.com/your-username/digital-health-wallet.git)
cd digital-health-wallet

2. Backend Setup
Bash

cd backend
npm install
mkdir uploads
node server.js
Note: The server will run on http://localhost:5000.

3. Frontend Setup
Open a new terminal window:

Bash

cd frontend
npm install
npm run dev
Note: The frontend will run on http://localhost:5173.
```
##🛡️ Security Features
---
Password Hashing: Bcrypt ensures user passwords are never stored in plain text.

Access Control: Viewers are strictly prohibited from deleting or sharing patient data.

JWT Protection: All sensitive API routes require a valid token to process requests.
