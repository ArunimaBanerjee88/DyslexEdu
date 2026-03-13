# 📚 DyslexEdu – AI Learning Companion for Dyslexic Students

An AI-powered educational platform designed to support dyslexic learners through personalized explanations, adaptive learning tools, and interactive educational assistance.

DyslexEdu combines a **custom TinyLLM language model**, a **Node.js backend**, and a **modern React frontend** to deliver an intelligent learning environment for children with reading difficulties.

The platform helps students understand reading concepts, practice alphabet learning, and build confidence through supportive AI responses.

---

# 🌟 Project Vision

Dyslexia affects millions of learners worldwide and often creates barriers to reading, spelling, and comprehension.

DyslexEdu aims to create a **safe, supportive, and personalized learning experience** where students can:

- ask questions about reading and learning
- receive simplified AI explanations
- practice alphabet and phonics
- take learning assessments
- receive encouraging responses

The system bridges **Artificial Intelligence and Education** to assist dyslexic learners.

---

# 🏗 System Architecture

```

Frontend (React + Vite)
│
▼
Node.js Backend Server
│
▼
Python FastAPI (LLM Service)
│
▼
TinyLLM Model + Educational Dataset
│
▼
Generated Learning Response

```

The project is divided into three main components:

| Layer | Description |
|------|-------------|
| Client | User interface and learning modules |
| Server | API routing and chatbot communication |
| LLM | TinyLLM model serving AI responses |

---

# 🗂 Project Structure

```

DyslexEdu
│
├── client
│   ├── React frontend
│   ├── chatbot interface
│   ├── learning modules
│   └── parent assistive test
│
├── server
│   ├── Node.js backend
│   ├── API routes
│   └── chatbot message handling
│
├── llm
│   ├── TinyLLM model (PyTorch)
│   ├── tokenizer files
│   ├── FastAPI API server
│   └── training dataset
│
└── README.md

```

---

# ⚙️ Tech Stack

<p align="center">

<img src="https://skillicons.dev/icons?i=python,pytorch,nodejs,react,js,html,css,fastapi,git,github,vscode" />

</p>

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express.js
- REST APIs

### AI / Machine Learning
- PyTorch
- SentencePiece
- FastAPI
- Uvicorn

### Development Tools
- Git
- GitHub
- Visual Studio Code

---

# 🚀 Features

### 🤖 AI Learning Assistant
Students can ask questions related to reading and dyslexia and receive simplified explanations.

---

### 🎓 Age-Based Learning Sections

| Age Group | Description |
|----------|-------------|
| 4-8 Years | Alphabet learning, phonics, and basic reading |
| 8+ Years | Conceptual learning and AI chatbot |

---

### 🧩 Parent Assistive Test

Parents can test how much their child has learned.

Features include:

- Alphabet recognition
- Matching letters with pictures
- Letter sequence questions
- Multiple choice tests
- Score calculation
- Encouraging feedback instead of pass/fail

---

### 💬 Intelligent Chatbot

The chatbot supports:

- educational questions
- dyslexia explanations
- encouragement messages
- personalized responses

---

### 🧠 TinyLLM Model

A lightweight **LSTM-based language model** trained on educational dyslexia content.

Capabilities include:

- answering learning questions
- generating supportive responses
- retrieving answers from training data

---

# 📦 Installation Requirements

### Node.js

```

Node.js >= 18
npm install

```

### Required Python Libraries

```

torch
sentencepiece
fastapi
uvicorn

```

Install using:

```

pip install torch sentencepiece fastapi uvicorn

```

---

# ▶️ How to Run the Project

The system requires **three services running simultaneously**.

---

# 1️⃣ Run the AI Model Server

Navigate to the LLM folder:

```

cd llm

```

Start the FastAPI server:

```

uvicorn api:app --host 0.0.0.0 --port 8000

```

This starts the AI service.

---

# 2️⃣ Run the Backend Server

Navigate to the server folder:

```

cd server

```

Install dependencies:

```

npm install

```

Start the backend server:

```

node index.js

```

Backend will run at:

```

[http://localhost:3000](http://localhost:3000)

```

---

# 3️⃣ Run the Frontend

Navigate to the client folder:

```

cd client

```

Install dependencies:

```

npm install

```

Start the frontend server:

```

npm run dev

```

Application will run at:

```

[http://localhost:5173](http://localhost:5173)

```

---

# 📡 Example API Request

### Request

```

POST /chat

{
"question": "What is dyslexia?"
}

```

### Response

```

{
"answer": "Dyslexia is a learning difference that can make reading and spelling harder.",
"emotion": "happy"
}

```

# 🔮 Future Improvements

Potential future enhancements include:

- speech-to-text learning
- MultiLingual 
- pronunciation feedback
- advanced personalisation
- adaptive difficulty detection
- larger transformer-based models

---

# 👩‍💻 Author

**Arunima Banerjee**

GitHub  
https://github.com/ArunimaBanerjee88

---

# 📄 License

This project is developed for **educational and research purposes**.

