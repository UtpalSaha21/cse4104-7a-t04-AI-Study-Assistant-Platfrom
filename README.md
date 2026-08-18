# AI Study Assistant Platform

An AI-powered study assistant platform developed for CSE 4104 – Software Development III. The system integrates a React frontend, Node.js/Express backend, MongoDB database, and Google Gemini AI to provide students with intelligent study and learning tools.

---

## Course Information

- **Course:** Software Development III
- **Course Code:** CSE 4104
- **Department:** Computer Science and Engineering
- **Project Type:** AI-Based Software Project

---

## Team Information

### Team Name

CSE4104-7A-T04

### Team Leader

- Utpal Saha — 11230121085

### Team Members

- Prianka Mondal — 11230121089
- Anuja Das — 11230121096
- Nazmul Hasan Emon — 11230121098

---

## Project Overview

The AI Study Assistant Platform is designed to help students improve their learning efficiency through AI-assisted study tools.

The platform brings together multiple learning features into a single application, allowing students to communicate with an AI assistant, generate summaries, create quizzes, and manage their study plans.

---

## Major Features

### 1. User Authentication

- User registration
- User login
- Password hashing
- JWT-based authentication
- Logout
- Protected API access
- User profile management

### 2. AI Chat Assistant

Students can interact with an AI assistant through the application.

The chat workflow is:

    React Frontend
          ↓
      Backend API
          ↓
      Chat Controller
          ↓
    Google Gemini API
          ↓
      AI Response
          ↓
      Frontend

Chat history is also stored and retrieved through the backend.

### 3. AI Summarizer

Students can submit study materials and generate AI-powered summaries.

The summarization workflow processes the request through the backend and uses Gemini to generate meaningful study content.

### 4. AI Quiz Generator

Students can generate quizzes based on a selected topic or uploaded study material.

Features include:

- Topic-based quiz generation
- PDF-based quiz generation
- Difficulty selection
- Question count selection
- Four-option multiple-choice questions
- AI-generated explanations
- Quiz history
- Quiz submission
- Automatic answer evaluation
- Score display
- Question-by-question review

AI-generated quiz responses are validated by the backend before being stored.

### 5. Study Planner

The study planner allows students to manage study-related tasks and planning information.

Features include:

- Creating tasks
- Retrieving tasks
- Updating tasks
- Completing tasks
- Planner data retrieval
- Database persistence

### 6. Dashboard

The dashboard provides an overview of the student's study activities and provides quick access to the major features of the platform.

### 7. User Profile

Students can view and manage their profile information and log out from the application.

---

## Technology Stack

### Frontend

- React.js
- Tailwind CSS
- Axios
- Motion
- Lucide React
- Vite

### Backend

- Node.js
- Express.js
- JWT
- bcrypt
- REST API

### Database

- MongoDB Atlas
- Mongoose

### Artificial Intelligence

- Google Gemini API
- @google/genai

---

## System Architecture

    ┌─────────────────────┐
    │   React Frontend    │
    │                     │
    │ Dashboard           │
    │ AI Chat             │
    │ Summarizer          │
    │ Quiz                │
    │ Planner             │
    │ Profile             │
    └──────────┬──────────┘
               │
               │ REST API
               ↓
    ┌─────────────────────┐
    │  Node.js / Express  │
    │      Backend        │
    │                     │
    │ Routes              │
    │ Controllers         │
    │ Services            │
    │ Authentication      │
    └───────┬───────┬─────┘
            │       │
    ┌───────┘       └────────────┐
    ↓                            ↓
    ┌─────────────────┐   ┌─────────────────┐
    │  MongoDB Atlas  │   │ Google Gemini   │
    │                 │   │      API        │
    │ Users           │   │                 │
    │ Chats           │   │ AI Chat         │
    │ Quizzes         │   │ Summaries       │
    │ Tasks           │   │ Quizzes         │
    │ Planner Data    │   │                 │
    └─────────────────┘   └─────────────────┘

---

## Project Structure

    AI-Study-Assistant-Platform/
    │
    ├── backend/
    │   └── src/
    │       ├── config/
    │       ├── controllers/
    │       ├── middleware/
    │       ├── models/
    │       ├── routes/
    │       ├── services/
    │       └── server.js
    │
    ├── frontend/
    │   └── src/
    │       ├── components/
    │       ├── services/
    │       ├── App.jsx
    │       └── main.jsx
    │
    ├── docs/
    ├── screeshots/
    ├── .gitignore
    ├── LICENSE
    └── README.md

---

## AI Integration

Google Gemini is integrated through the backend.

The Gemini API key is stored in an environment variable and is not included in the repository.

Example environment configuration:

    GEMINI_API_KEY=your_gemini_api_key

The actual API key must never be committed to GitHub.

AI-related errors are handled through a dedicated service:

    backend/src/services/aiErrorHandler.js

The application handles situations such as:

- AI rate limiting
- AI timeout
- Network errors
- General AI/API failures
- Invalid AI-generated responses

---

## Error Handling

The application includes error handling across major backend and AI workflows.

Examples include:

- Invalid user input
- Missing required information
- Authentication failures
- AI service failures
- API failures
- Network errors
- Invalid AI-generated quiz formats
- Empty or incomplete AI responses

User-facing responses are returned instead of exposing raw technical errors where appropriate.

---

## Database

MongoDB Atlas is used for persistent application data.

The database is used for features including:

- User accounts
- Authentication-related data
- Chat history
- Quiz history
- Quiz results
- Study tasks
- Planner information

---

## Frontend–Backend Integration

The frontend communicates with the backend through REST APIs.

Major integrated workflows include:

    Registration
        ↓
    Login
        ↓
    Authentication
        ↓
    Dashboard
        ↓
    Feature Selection
        ↓
    API Request
        ↓
    Backend Processing
        ↓
    Database / Gemini AI
        ↓
    API Response
        ↓
    Frontend Result

---

## Authentication Flow

    User
     ↓
    Registration / Login
     ↓
    Backend Authentication API
     ↓
    Password Verification
     ↓
    JWT Token
     ↓
    Frontend Storage
     ↓
    Authenticated API Requests
     ↓
    Protected Backend Resources

---

## Current Project Status

The project has progressed from the planning and design stages into the implementation and integration stage.

### Completed

- Project architecture
- Database design
- Backend setup
- Frontend implementation
- User authentication
- JWT authentication
- Dashboard
- AI Chat
- AI Summarizer
- AI Quiz Generator
- Quiz history
- Quiz submission and evaluation
- Study Planner
- Task management
- Gemini AI integration
- Frontend–backend API integration
- AI error handling
- AI response validation

### In Progress

- Full system integration testing
- UI/UX refinement
- Responsive interface testing
- Error scenario testing
- Documentation
- Final project preparation

---

## Environment Variables

Create a `.env` file in the backend directory.

Example:

    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key

Do not commit the `.env` file to GitHub.

---

## Installation

### Clone the Repository

    git clone https://github.com/UtpalSaha21/cse4104-7a-t04-AI-Study-Assistant-Platfrom.git
    cd cse4104-7a-t04-AI-Study-Assistant-Platfrom

### Backend

    cd backend
    npm install
    npm run dev

### Frontend

Open another terminal:

    cd frontend
    npm install
    npm run dev

Configure the required environment variables before starting the backend.

---

## Development

The project is developed using separate frontend and backend branches.

Major development areas include:

- Frontend development
- Backend API development
- Database integration
- AI integration
- Authentication
- Testing
- Documentation

Meaningful commit messages are used to track development progress.

---

## Deployment

Planned deployment configuration:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

Live deployment status may vary depending on the current project stage.

---

## Documentation

Project documentation includes:

- Project Proposal
- Software Requirements Specification (SRS)
- System Design
- UI/UX Design
- Weekly Progress Reports
- Integration Documentation
- Testing Documentation

---

## Team Contribution

Each team member contributes to different aspects of the project including:

- Frontend development
- Backend development
- AI integration
- Authentication
- Database management
- Testing
- Documentation
- Project coordination

---

## Project Repository

GitHub:

https://github.com/UtpalSaha21/cse4104-7a-t04-AI-Study-Assistant-Platfrom

---

## License

This project is developed for academic purposes as part of CSE 4104 – Software Development III.