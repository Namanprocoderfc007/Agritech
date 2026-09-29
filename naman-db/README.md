# AgriGuard - AI Agronomist for Precision Farming

## Overview
AgriGuard is an intelligent agricultural system that leverages multimodal AI to help farmers detect plant diseases, optimize pest management, and improve crop health through data-driven insights.

## Features
1. **Multimodal Analysis** - Process satellite/drone imagery and detect plant stress
2. **Disease Diagnosis** - Identify pests and diseases from leaf photos
3. **IPM Strategy** - Generate sustainable integrated pest management plans
4. **Conversational AI** - Talk to your AI agronomist in natural language
5. **Predictive Analytics** - Forecast disease outbreaks using weather data

## Tech Stack
- **Backend**: Python FastAPI
- **Frontend**: React + TypeScript
- **AI/Vision**: Claude Vision API / Gemini / Groq
- **Database**: SQLite/PostgreSQL
- **Weather API**: Open-Meteo (Free)

## Project Structure
```
agriguard/
├── backend/              # Python FastAPI server
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── models/       # AI model interfaces
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── requirements.txt
│   └── .env
├── frontend/             # React web app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── .env
└── docs/                 # Documentation
```
Visit:- (https://agriguard2-0-liy8.vercel.app/app)
