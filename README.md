# ⚡ Smart Meter Dashboard

## Full-Stack IoT Monitoring Platform

**Tech Stack:** MERN (MongoDB, Express, React, Node.js) | Tailwind CSS | IoT Integration

### 🎯 Overview
This project is a real-time IoT (Internet of Things) dashboard engineered to monitor hardware prototype readings. It processes data streams from embedded devices, providing users with live data visualization and critical alerting mechanisms.

### ✨ Key Features
* **Real-Time Data Flow:** Architected a robust REST API using **Node.js/Express** to handle data ingestion and visualize readings in real-time with **sub-second latency**.
* **Secure Payment Gateway:** Implemented automated billing through a secure payment gateway for efficient client invoicing.
* **Critical Alerts:** Developed an **SMS notification system** for immediate theft detection and proactive hardware monitoring.
* **Scalable Architecture:** Used **MongoDB** for flexible data storage and aggregation of historical metrics.
* **Modern UI:** Built a highly responsive and data-dense user interface using **React** and **Tailwind CSS**.

### 🔗 Live Demo & Links
| Type | URL |
| Live Application | https://cepahzz-zo63.vercel.app/ |

### ⚙️ Local Installation
To get a copy of the project running locally for development and testing:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/YourUsername/smart-meter-dashboard.git](https://github.com/YourUsername/smart-meter-dashboard.git)
    cd smart-meter-dashboard
    ```

2.  **Install Dependencies (Client & Server):**
    ```bash
    npm install  # Install server dependencies
    cd client && npm install  # Install React dependencies
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory and add your connection strings (e.g., `MONGO_URI`, `STRIPE_SECRET_KEY`, etc.).

4.  **Run the Project:**
    ```bash
    npm start # Or your custom script to run both client and server
    ```

### 🤝 Contributions
If you are interested in extending this project, please open an issue or submit a pull request!
