# Emma – AI-Powered Desktop Personal Assistant
## Overview

**Emma** is an AI-powered desktop personal assistant that combines artificial intelligence, voice interaction, desktop automation, and cybersecurity monitoring into one unified application.

Built with a modern React frontend and a Python-based FastAPI backend, Emma provides an interactive environment where users can communicate with an AI assistant, execute computer-related commands, monitor system performance, and manage everyday tasks.

The project integrates AI language models, speech technologies, and system-level utilities to create a more intuitive and intelligent desktop experience.

## Key Features

### 1. AI-Powered Conversational Assistant

- Interactive AI-powered chat interface.
- Natural language communication.
- Integration with OpenAI and Google Gemini APIs.
- Persistent conversation and user-memory storage.
- Context-aware assistant interactions.

### 2. Voice Interaction

- Voice-based input and interaction.
- Speech recognition for converting spoken commands into text.
- Text-to-speech responses.
- Hands-free interaction with the assistant.

### 3. Intelligent Desktop Automation

- Execute computer-related commands using natural language.
- Application launching and desktop interaction.
- Command processing and execution.
- File and system-related operations.

### 4. System Monitoring

- Real-time CPU usage monitoring.
- RAM utilization tracking.
- Battery status monitoring.
- Disk usage monitoring.
- System status dashboard.

### 5. Cybersecurity Monitoring

- Dedicated security monitoring interface.
- Security-related system information.
- Integration with security monitoring components.

### 6. Modern User Interface

- Modern React-based interface.
- Interactive dashboard.
- Dedicated chat interface.
- Sidebar navigation.
- Theme customization.
- Responsive component-based architecture.

## Technology Stack

| Component          | Technologies                                |
| ------------------ | ------------------------------------------- |
| Frontend           | React 19, TypeScript                        |
| Build Tool         | Vite                                        |
| Styling            | Tailwind CSS, CSS                           |
| Backend            | Python, FastAPI                             |
| Server             | Uvicorn                                     |
| Database           | SQLite                                      |
| AI Integration     | OpenAI API, Google Gemini API               |
| Voice Recognition  | React Speech Recognition, SpeechRecognition |
| Text-to-Speech     | pyttsx3                                     |
| System Monitoring  | psutil                                      |
| HTTP Communication | Axios                                       |
| Version Control    | Git, GitHub                                 |

## Project Architecture

Emma follows a frontend-backend architecture where the React application communicates with the Python backend through REST APIs.

```text
Emma/
│
├── backend/
│   ├── agent/
│   ├── assistant/
│   ├── database/
│   ├── desktop/
│   │   ├── controllers/
│   │   └── nlu/
│   ├── models/
│   ├── prompts/
│   ├── routes/
│   ├── screenshots/
│   ├── services/
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## How It Works

1. **User Interaction:** Users communicate with Emma through text or voice.
2. **Frontend Processing:** The React application handles user interaction and sends requests to the backend.
3. **Backend Processing:** FastAPI receives requests and routes them to the appropriate services.
4. **AI Processing:** AI integrations process conversational requests and generate intelligent responses.
5. **Command Execution:** The command engine handles supported desktop operations.
6. **System Monitoring:** System utilities collect performance information and provide it to the dashboard.
7. **Response Delivery:** The backend returns the processed response to the frontend.

## Installation and Setup

### Prerequisites

Make sure you have the following installed:

- Python 3.11 or above
- Node.js and npm
- Git
- OpenAI API key and/or Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Sarthakparashetti/Emma-AI-Assistant.git
cd Emma-AI-Assistant
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables using the provided example:

```powershell
Copy-Item .env.example .env
```

Add your own API credentials to the `.env` file using the variable names provided in `.env.example`.

Start the backend server:

```bash
uvicorn main:app --reload
```

The backend API will be available at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal to access Emma.

## Environment Variables

Emma uses environment variables to manage API credentials and configuration.

Create a `.env` file inside the backend directory and configure the variables listed in `.env.example`.

**Important:** Never upload your actual API keys, passwords, or sensitive credentials to GitHub.

## Future Enhancements

- Advanced AI agent capabilities.
- More intelligent desktop automation.
- Expanded cybersecurity monitoring.
- Improved contextual memory.
- Additional third-party integrations.
- Enhanced voice interaction and personalization.

## Project Information

**Project Name:** Emma – AI Desktop Assistant

**Category:** Artificial Intelligence | Desktop Automation | Voice Assistant | Cybersecurity

**Development:** Personal Capstone Project

**Repository:** [Emma AI Assistant on GitHub](https://github.com/Sarthakparashetti/Emma-AI-Assistant)

## Author

**Sarthak Parashetti**

Computer Engineering Student | AI & Software Development Enthusiast

- GitHub: [@Sarthakparashetti](https://github.com/Sarthakparashetti)
