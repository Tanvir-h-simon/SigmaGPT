# SigmaGPT

A full-stack AI chat application built with React and Node.js, powered by the OpenAI API. Features user authentication, persistent conversation threads, file attachment support, and a switchable temporary (incognito) chat mode.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component library with hooks-based state management |
| **Vite 8** | Next-generation build tool and dev server |
| **react-markdown** + **remark-gfm** | Renders AI responses as formatted Markdown with GitHub Flavored Markdown support |
| **Custom CSS** | Hand-written responsive styling (no UI framework) |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + **Express 5** | HTTP server and REST API |
| **MongoDB** + **Mongoose** | NoSQL database with ODM for conversation thread persistence |
| **JSON Web Tokens (JWT)** | Stateless auth tokens stored in HTTP-only cookies |
| **bcrypt** | Password hashing with salt rounds |
| **Multer** | Multipart form-data handling for file uploads |
| **cookie-parser** | Secure HTTP-only cookie management |
| **CORS** | Cross-origin resource sharing configuration |
| **dotenv** | Environment variable management |
| **OpenAI API** | GPT model integration via `/v1/responses` endpoint |

---

## Features

- **JWT Authentication** — Signup, login, and logout with tokens stored in HTTP-only cookies for XSS protection
- **Persistent Chat Threads** — Conversations saved to MongoDB; thread history shown in a collapsible sidebar
- **Temporary Chat Mode** — Incognito sessions that are never persisted to the database
- **Model Selection** — Switch between OpenAI models (e.g. `gpt-4o-mini`) at runtime
- **File Attachments** — Attach images and PDFs alongside messages via Multer
- **Markdown Rendering** — AI responses rendered with full Markdown and GFM support (tables, code blocks, etc.)
- **Auto-resizing Input** — Textarea grows with content up to a max height
- **Responsive Layout** — Collapsible sidebar and adaptive main content area

---

## Architecture

```
SigmaGPT/
├── server.js              # Express app entry point
├── routes/
│   ├── auth.js            # POST /signup, /login, /logout · GET /me
│   └── chat.js            # POST /chat · GET|DELETE /threads/:id
├── models/
│   ├── User.js            # Mongoose schema with bcrypt pre-save hook
│   └── Thread.js          # Conversation thread schema
├── utils/
│   └── openai.js          # OpenAI API client (fetch-based)
└── frontend/              # Vite + React SPA
    └── src/
        ├── App.jsx        # Root state management and API calls
        ├── Auth.jsx       # Login / signup form
        ├── Sidebar.jsx    # Thread list and user controls
        ├── Navbar.jsx     # Model selector and mode toggle
        ├── ChatWindow.jsx # Message history display
        └── Chat.jsx       # Input box with file attachment toolbar
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI
- OpenAI API Key

### Installation

```bash
# Clone the repo
git clone https://github.com/Tanvir-h-simon/SigmaGPT.git
cd SigmaGPT

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_ATLAS_URL=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=3000
```

### Running the App

```bash
# Start the backend (from root)
node server.js

# Start the frontend (in a separate terminal)
cd frontend && npm run dev
```

The app will be available at `http://localhost:5173`, with the API running on `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and set cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Return current user from cookie |
| `POST` | `/api/chat` | Send a message (supports file uploads) |
| `GET` | `/api/threads` | List all conversation threads |
| `GET` | `/api/threads/:id` | Fetch a single thread with messages |
| `DELETE` | `/api/threads/:id` | Delete a thread |

---

## Author

**Tanvir Hossain** — [GitHub](https://github.com/Tanvir-h-simon)
