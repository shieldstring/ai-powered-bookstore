# AI-Powered Social-Ecommerce Platform

AI-Powered Social-Ecommerce Platform is a comprehensive system integrating eCommerce, social networking, and MLM for book sales, community engagement, and earning opportunities.

## Structure

* `frontend/`: React frontend.
* `backend/`: Node.js backend.
* `recommendation-engine/`: Python recommendation engine.

## Getting Started

### Prerequisites

* Node.js and npm (or yarn)
* Python 3.x
* MongoDB
* Docker (optional, but recommended)

### Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd ai-powered-bookstore
    ```

2.  **Install dependencies:**

    * **Frontend:**

        ```bash
        cd frontend
        npm install
        cd ..
        ```

    * **Backend:**

        ```bash
        cd backend
        npm install
        cd ..
        ```

    * **Recommendation Engine:**

        ```bash
        cd recommendation-engine
        python3 -m venv venv
        source venv/bin/activate  # On macOS/Linux
        #venv\Scripts\activate #On Windows
        pip install -r requirements.txt
        cd ..
        ```

3.  **Configure environment variables:**

    * Create `.env` files in `backend/` and `frontend/` as needed.
    * Configure MongoDB connection in `backend/config/config.js` or `.env`.

4.  **Run the applications:**

    * **Backend:**

        ```bash
        cd backend
        npm run dev #or npm run start
        cd ..
        ```

    * **Frontend:**

        ```bash
        cd frontend
        npm start
        cd ..
        ```

    * **Recommendation Engine:**

        ```bash
        cd recommendation-engine
        source venv/bin/activate
        python app.py
        cd ..
        ```

## Docker (Optional but Recommended)

For Docker setup and instructions, refer to the respective `README.md` files in the `frontend/`, `backend/`, and `recommendation-engine/` directories.

## Contributing

...