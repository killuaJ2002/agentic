# 🧠 LangChain Agent API

An AI-powered backend agent that turns natural language into real-world browser actions.

## 🚀 Overview

This project uses an **LLM** (via LangChainJS) to extract actionable data from user prompts (like "Book a table for two in Guwahati this Friday") and then automates the task using **Playwright**. It's modular and exposes this flow as an **API endpoint**, ready to be used from a frontend UI or CLI.

## 🧩 Tech Stack

- **LLM:** Any provider supported by LangChain (OpenAI, Gemini, etc.)
- **Automation:** Playwright
- **Server:** Node.js + Express
- **API:** REST (JSON)

## 🛠️ Features

- Natural language understanding
- Data extraction (place, date, item, etc.)
- Web task automation (form fills, clicks, navigation)
- Easy integration via API

## 📦 Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/killuaJ2002/agentic.git
   cd agentic
   ```
