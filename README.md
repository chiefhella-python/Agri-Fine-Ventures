# Agri-Fine Ventures - Greenhouse Management System

A complete greenhouse management system with Node.js backend and vanilla JavaScript frontend.

## Project Structure

```
Agri-fine-Ventures/
├── frontend/           # Frontend files (static HTML/CSS/JS)
│   ├── index.html
│   ├── api.js
│   ├── state.js
│   ├── app.js
│   ├── admin.js
│   ├── supervisor.js
│   ├── agronomist.js
│   └── ...
│
└── backend/           # Node.js API server
    ├── server.js
    ├── package.json
    └── routes/
        ├── auth.js
        ├── greenhouses.js
        ├── sensors.js
        └── admin.js
```

## Running the System

### Prerequisites
- Node.js 18+
- Python (for frontend static server)

### 1. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend runs on **http://localhost:3000**

### 2. Start the Frontend

Open a new terminal:

```bash
cd frontend
python -m http.server 8080
```

Or simply open `frontend/index.html` directly in your browser.

The frontend runs on **http://localhost:8080**

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | agrifineventures@gmail.com | demo_admin |
| Supervisor | supervisor@agrifine.com | demo_supervisor |
| Agronomist | agronomist@agrifine.com | demo_agronomist |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/users` - Get all users

### Greenhouses
- `GET /api/greenhouses` - Get all greenhouses
- `GET /api/greenhouses/:id` - Get greenhouse by ID
- `POST /api/greenhouses` - Create greenhouse
- `PUT /api/greenhouses/:id` - Update greenhouse
- `DELETE /api/greenhouses/:id` - Delete greenhouse

### Sensors
- `GET /api/sensors/:greenhouseId` - Get sensor readings
- `GET /api/sensors/:greenhouseId/latest` - Get latest readings
- `POST /api/sensors/:greenhouseId` - Submit sensor reading
- `GET /api/sensors/:greenhouseId/analytics` - Get analytics

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/settings` - Get settings
- `GET /api/admin/logs` - Get system logs

## Crops

The system manages greenhouses growing:
- 🍅 Tomatoes
- 🫑 Capsicum
- 🥒 Cucumber

## Features

- **Admin Dashboard**: Full management of greenhouses, tasks, workers, inventory, and reports
- **Supervisor Dashboard**: View assigned greenhouses, manage tasks, record harvests
- **Agronomist Dashboard**: Monitor crop health, create reports, manage feeding programs
- **Real-time Weather**: Integration with Open-Meteo API for Nairobi weather data

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS (PWA-ready)
- **Backend**: Node.js, Express.js
- **Storage**: In-memory (can be extended to database)
"# agrifine-ventures" 
