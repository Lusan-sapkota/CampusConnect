# CampusConnect Installation Guide

## Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- pip (Python package manager)

## Backend Setup

```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python init_database.py #Optional
python run.py
```

## Frontend Setup

```sh
cd frontend
npm install
npm run dev
```

## Environment Variables

- Copy `.env.example` to `.env` in the backend folder and update values as needed.

```sh
cp .env.example .env
```

## Database Initialization

- Run `python backend/init_database.py` to create tables and sample data.

## Accessing the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api