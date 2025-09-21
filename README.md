# AI Summary Bot

A sophisticated full-stack application for intelligent text and URL summarization using OpenAI's GPT models. Built with modern web technologies and following clean architecture principles.

## 🎯 Overview

This system leverages advanced AI to analyze and summarize text content from various sources including direct text input and web URLs. The application provides multiple output formats and customizable summary lengths to meet diverse user needs.

## 🏗️ Architecture

The project follows a clean, modular architecture with clear separation of concerns:

- **Backend**: Node.js/Express API with TypeScript
- **Frontend**: React 19 with Create React App
- **AI/ML**: OpenAI GPT API integration
- **Design Pattern**: Component-driven development with service layer abstraction

## 📁 Project Structure

```
ai-summary-bot/
├── backend/                   # Node.js/Express API server
│   ├── src/
│   │   ├── app.ts            # Express application setup
│   │   ├── server.ts         # Server entry point
│   │   ├── config.ts         # Configuration management
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic layer
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── App.js            # Main application component
│   │   ├── index.js          # Application entry point
│   │   └── components/       # UI components
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Features

### Backend Features

- **AI-Powered Summarization**: Advanced text analysis using OpenAI GPT models
- **URL Content Extraction**: Intelligent web scraping with Cheerio
- **Multiple Output Formats**: Paragraph, bullet points, insights, and themes
- **Flexible Length Options**: Short, medium, and long summaries
- **Text Sanitization**: Automatic handling of special characters and formatting
- **Rate Limiting**: Built-in protection against API abuse
- **CORS Support**: Cross-origin resource sharing enabled
- **Security Headers**: Helmet.js integration for enhanced security

### Frontend Features

- **Modern UI**: Clean, responsive design
- **Real-time Analysis**: Instant summarization results
- **Interactive Components**: User-friendly interface elements
- **Error Handling**: Graceful error management
- **Loading States**: Visual feedback for user actions

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js (≥16.0.0)
- **Framework**: Express.js
- **Language**: TypeScript
- **AI Service**: OpenAI GPT API
- **Web Scraping**: Cheerio + Axios
- **Security**: Helmet.js, CORS
- **Dev Tools**: Nodemon, ESLint

### Frontend

- **Framework**: React 19
- **Build Tool**: Create React App
- **Language**: JavaScript
- **Testing**: Jest, React Testing Library
- **Dev Tools**: React Scripts

## 📋 Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- OpenAI API key

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-summary-bot
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Running the Application

### Development Mode

**Start the Backend Server:**

```bash
cd backend
npm run dev
```

The backend server will start on http://localhost:3000

**Start the Frontend Development Server (in a new terminal):**

```bash
cd frontend
npm start
```

The frontend will be available at http://localhost:3000

### Production Build

**Build the Backend:**

```bash
cd backend
npm run build
npm start
```

**Build the Frontend:**

```bash
cd frontend
npm run build
```

## 📡 API Endpoints

### POST `/api/v1/summary/text`

Summarizes provided text content.

**Request Body:**

```json
{
  "text": "Your text content here...",
  "format": "paragraph",
  "length": "medium"
}
```

### POST `/api/v1/summary/url`

Extracts and summarizes content from a web URL.

**Request Body:**

```json
{
  "url": "https://example.com/article",
  "format": "bullets",
  "length": "short"
}
```

**Response:**

```json
{
  "success": true,
  "summary": "Generated summary content...",
  "metadata": {
    "format": "paragraph",
    "length": "medium",
    "originalLength": 1500,
    "summaryLength": 250
  }
}
```

## 📦 Build Scripts

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm run lint` - Run ESLint

### Frontend

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## 🔧 Configuration

### Backend Configuration

- OpenAI API settings
- Server port configuration
- CORS settings
- Rate limiting parameters

### Environment Variables

| Variable         | Description      | Default     |
| ---------------- | ---------------- | ----------- |
| `OPENAI_API_KEY` | OpenAI API key   | Required    |
| `PORT`           | Server port      | 3000        |
| `NODE_ENV`       | Environment mode | development |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the language models
- React team for the excellent development framework
- Express.js community for the robust backend framework

Built with ❤️ using modern web technologies and clean code principles.
