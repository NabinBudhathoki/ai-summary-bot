# Frontend Integration Guide

This guide explains how to integrate your React frontend with the Summary Bot Backend.

## Backend Server

The backend is running on `http://localhost:3001` with the following main endpoints:

### Available Endpoints

1. **Text Summarization**: `POST /api/v1/summary/text`
2. **AI Text Detection**: `POST /api/v1/ai-detection/detect`
3. **Study Guide Generation**: `POST /api/v1/study-guide/generate`
4. **Health Check**: `GET /api/health`

## Frontend Integration Steps

### 1. Update Frontend API Calls

In your React frontend, update your API calls to point to the backend:

```javascript
// API base URL
const API_BASE_URL = "http://localhost:3001";

// Text Summarization
export const generateSummary = async (text, summaryType = "summary") => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/summary/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        summaryType,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};

// AI Text Detection
export const detectAIText = async (text) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ai-detection/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error detecting AI text:", error);
    throw error;
  }
};

// Study Guide Generation
export const generateStudyGuide = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/study-guide/generate`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating study guide:", error);
    throw error;
  }
};
```

### 2. Error Handling

Implement proper error handling in your frontend:

```javascript
// Error handling example
const handleSummaryGeneration = async (text) => {
  try {
    setLoading(true);
    const result = await generateSummary(text, "brief");
    setSummary(result.summary);
    setError(null);
  } catch (error) {
    setError("Failed to generate summary. Please try again.");
    console.error("Summary error:", error);
  } finally {
    setLoading(false);
  }
};
```

### 3. React Component Example

```jsx
import React, { useState } from "react";
import { generateSummary, detectAIText } from "./api";

function SummaryBot() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [aiDetection, setAiDetection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSummarize = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const result = await generateSummary(text, "brief");
      setSummary(result.summary);
    } catch (error) {
      setError("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleDetectAI = async () => {
    if (!text.trim() || text.length < 50) {
      setError("Please provide at least 50 characters for AI detection");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await detectAIText(text);
      setAiDetection(result);
    } catch (error) {
      setError("Failed to detect AI text");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-bot">
      <h2>Summary Bot</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to summarize or analyze..."
        rows={6}
        cols={50}
      />

      <div className="buttons">
        <button onClick={handleSummarize} disabled={loading}>
          {loading ? "Generating..." : "Generate Summary"}
        </button>
        <button onClick={handleDetectAI} disabled={loading}>
          {loading ? "Detecting..." : "Detect AI Text"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {summary && (
        <div className="summary">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}

      {aiDetection && (
        <div className="ai-detection">
          <h3>AI Detection Result:</h3>
          <p>
            <strong>Likely AI:</strong> {aiDetection.likely_ai ? "Yes" : "No"}
          </p>
          <p>
            <strong>Confidence:</strong> {aiDetection.confidence}%
          </p>
          <p>
            <strong>Rationale:</strong> {aiDetection.rationale}
          </p>
        </div>
      )}
    </div>
  );
}

export default SummaryBot;
```

### 4. File Upload Component Example

```jsx
import React, { useState } from "react";
import { generateStudyGuide } from "./api";

function StudyGuideGenerator() {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("summary");
  const [studyGuide, setStudyGuide] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerate = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await generateStudyGuide(file, type);
      setStudyGuide(result.content);
    } catch (error) {
      setError("Failed to generate study guide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="study-guide-generator">
      <h2>Study Guide Generator</h2>

      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
      />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="summary">Summary</option>
        <option value="points">Key Points</option>
        <option value="flashcards">Flashcards</option>
        <option value="quiz">Quiz</option>
        <option value="outline">Outline</option>
      </select>

      <button onClick={handleGenerate} disabled={loading || !file}>
        {loading ? "Generating..." : "Generate Study Guide"}
      </button>

      {error && <div className="error">{error}</div>}

      {studyGuide && (
        <div className="study-guide">
          <h3>Study Guide:</h3>
          <pre>{studyGuide}</pre>
        </div>
      )}
    </div>
  );
}

export default StudyGuideGenerator;
```

### 5. Environment Configuration

Create a `.env` file in your frontend with:

```
REACT_APP_API_URL=http://localhost:3001
```

Then update your API calls:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
```

## Starting Both Servers

1. **Backend**:

   ```bash
   cd backend
   npm run dev
   ```

   Server runs on: http://localhost:3001

2. **Frontend**:
   ```bash
   cd frontend
   npm start
   ```
   Server runs on: http://localhost:3000

## CORS Configuration

The backend is already configured to accept requests from `http://localhost:3000` (your React frontend).

## Testing Integration

1. Start both servers
2. Open your frontend at http://localhost:3000
3. Test the functionality:
   - Enter text and generate summaries
   - Upload files for study guide generation
   - Test AI text detection

## Troubleshooting

- **CORS errors**: Make sure backend CORS is configured for your frontend URL
- **Network errors**: Check that both servers are running
- **API key errors**: Verify your OpenAI API key is set in backend/.env
- **File upload errors**: Check file size limits and supported formats

The backend is fully functional and ready for integration with your React frontend!
