import React, { useState } from "react";
import "./App.css";

function App() {
  // State management
  const [currentTab, setCurrentTab] = useState("url");
  const [urlInput, setUrlInput] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("paragraph");
  const [textInput, setTextInput] = useState("");
  const [lengthSelect, setLengthSelect] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Switch between tabs
  const switchTab = (tabName) => {
    setCurrentTab(tabName);
  };

  // Select summary format
  const selectFormat = (format) => {
    setSelectedFormat(format);
  };

  // Validate URL format
  const validateUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  // Validate input
  const validateInput = () => {
    if (currentTab === "url") {
      if (!urlInput.trim()) {
        showNotification("Please enter a URL to summarize.", "error");
        return false;
      }
      if (!validateUrl(urlInput)) {
        showNotification(
          "Please enter a valid URL (starting with http:// or https://).",
          "error"
        );
        return false;
      }
    } else {
      if (!textInput.trim()) {
        showNotification("Please enter some text to summarize.", "error");
        return false;
      }
    }
    return true;
  };

  // Generate summary
  const generateSummary = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = "http://localhost:3001/api/v1/summary";
      let endpoint, payload;

      if (currentTab === "url") {
        endpoint = `${apiUrl}/url`;
        payload = {
          url: urlInput.trim(),
          format: selectedFormat,
          length: lengthSelect,
        };
      } else {
        endpoint = `${apiUrl}/text`;
        payload = {
          text: textInput.trim(),
          format: selectedFormat,
          length: lengthSelect,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate summary");
      }

      // Format the response data for display
      const summaryData = {
        title:
          currentTab === "url" ? `URL Summary - ${urlInput}` : "Text Summary",
        content:
          selectedFormat === "paragraph"
            ? data.summary
            : data.summary.split("\n").filter((line) => line.trim()),
        format: selectedFormat,
        originalLength: data.originalLength,
        summaryLength: data.summaryLength,
      };

      setSummary(summaryData);
      setShowResults(true);
      showNotification("Summary generated successfully!", "success");
    } catch (error) {
      console.error("Error generating summary:", error);
      showNotification(
        error.message || "Error generating summary. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy summary to clipboard
  const copySummary = async () => {
    if (!summary) return;

    let text = `${summary.title}\n\n`;
    if (summary.format === "paragraph") {
      text += summary.content;
    } else if (summary.format === "bullets") {
      summary.content.forEach((point) => {
        text += `• ${point}\n`;
      });
    } else {
      summary.content.forEach((item, index) => {
        text += `${summary.format === "insights" ? "Insight" : "Theme"} ${
          index + 1
        }: ${item}\n\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      showNotification("Summary copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showNotification("Failed to copy summary. Please try again.", "error");
    }
  };

  // Download summary
  const downloadSummary = () => {
    if (!summary) return;

    let text = `${summary.title}\n\n`;
    if (summary.format === "paragraph") {
      text += summary.content;
    } else if (summary.format === "bullets") {
      summary.content.forEach((point) => {
        text += `• ${point}\n`;
      });
    } else {
      summary.content.forEach((item, index) => {
        text += `${summary.format === "insights" ? "Insight" : "Theme"} ${
          index + 1
        }: ${item}\n\n`;
      });
    }

    const filename = `summary_${new Date().toISOString().split("T")[0]}.txt`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showNotification("Summary downloaded successfully!", "success");
  };

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Get button text based on current tab
  const getButtonText = () => {
    if (isLoading) return "Generating...";
    return currentTab === "url" ? "Summarize URL" : "Summarize Text";
  };

  return (
    <div className="container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>
            <i className="fas fa-robot"></i> GenAI Summary Bot
          </h1>
          <p className="hero-subtitle">
            Transform your documents and text into concise, structured summaries
            using advanced AI
          </p>
        </div>
      </header>

      <main className="main-content">
        <div className="input-section">
          <div className="input-tabs">
            <button
              className={`tab-button ${currentTab === "url" ? "active" : ""}`}
              onClick={() => switchTab("url")}
            >
              <i className="fas fa-link"></i> URL Summary
            </button>
            <button
              className={`tab-button ${currentTab === "text" ? "active" : ""}`}
              onClick={() => switchTab("text")}
            >
              <i className="fas fa-paragraph"></i> Input Text
            </button>
          </div>

          <div className="tab-content">
            {/* URL Input Tab */}
            <div
              className={`tab-panel ${currentTab === "url" ? "active" : ""}`}
            >
              <div className="url-input-area">
                <div className="url-input-wrapper">
                  <i className="fas fa-link input-icon"></i>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter a URL to summarize (e.g., https://example.com/article)"
                    className="url-input"
                  />
                </div>
                <div className="url-info">
                  <i className="fas fa-info-circle"></i>
                  <span>
                    Enter any web page URL to extract and summarize its content
                  </span>
                </div>
              </div>
            </div>

            {/* Text Input Tab */}
            <div
              className={`tab-panel ${currentTab === "text" ? "active" : ""}`}
            >
              <div className="text-input-area">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your text or paragraph here..."
                  rows="8"
                />
                <div className="char-counter">
                  <span>{textInput.length}</span> characters
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="options-section">
          <h3>
            <i className="fas fa-cogs"></i> Summary Options
          </h3>
          <div className="summary-options">
            <div className="option-group">
              <label className="option-label">Summary Format:</label>
              <div className="format-buttons">
                <button
                  className={`format-btn ${
                    selectedFormat === "paragraph" ? "active" : ""
                  }`}
                  onClick={() => selectFormat("paragraph")}
                >
                  <i className="fas fa-align-left"></i> Paragraph
                </button>
                <button
                  className={`format-btn ${
                    selectedFormat === "bullets" ? "active" : ""
                  }`}
                  onClick={() => selectFormat("bullets")}
                >
                  <i className="fas fa-list-ul"></i> Bullet Points
                </button>
                <button
                  className={`format-btn ${
                    selectedFormat === "insights" ? "active" : ""
                  }`}
                  onClick={() => selectFormat("insights")}
                >
                  <i className="fas fa-lightbulb"></i> Key Insights
                </button>
                <button
                  className={`format-btn ${
                    selectedFormat === "themes" ? "active" : ""
                  }`}
                  onClick={() => selectFormat("themes")}
                >
                  <i className="fas fa-tags"></i> Themes
                </button>
              </div>
            </div>

            <div className="option-group">
              <label className="option-label">Summary Length:</label>
              <select
                value={lengthSelect}
                onChange={(e) => setLengthSelect(e.target.value)}
              >
                <option value="short">Short (3-5 points)</option>
                <option value="medium">Medium (5-8 points)</option>
                <option value="long">Long (8-12 points)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="action-section">
          <button
            className="generate-btn"
            onClick={generateSummary}
            disabled={isLoading}
          >
            <i className="fas fa-magic"></i>
            <span>{getButtonText()}</span>
            {isLoading && <div className="loading-spinner"></div>}
          </button>
        </div>

        {showResults && summary && (
          <div className="result-section">
            <div className="result-header">
              <h3>
                <i className="fas fa-file-alt"></i> Summary Result
              </h3>
              <div className="result-actions">
                <button className="action-btn" onClick={copySummary}>
                  <i className="fas fa-copy"></i> Copy
                </button>
                <button className="action-btn" onClick={downloadSummary}>
                  <i className="fas fa-download"></i> Download
                </button>
              </div>
            </div>
            <div className="summary-output">
              <h4>{summary.title}</h4>
              {summary.originalLength && summary.summaryLength && (
                <div className="summary-stats">
                  <span className="stat">
                    <i className="fas fa-file-text"></i>
                    Original: {summary.originalLength.toLocaleString()}{" "}
                    characters
                  </span>
                  <span className="stat">
                    <i className="fas fa-compress"></i>
                    Summary: {summary.summaryLength.toLocaleString()} characters
                  </span>
                  <span className="stat">
                    <i className="fas fa-percentage"></i>
                    Reduction:{" "}
                    {Math.round(
                      (1 - summary.summaryLength / summary.originalLength) * 100
                    )}
                    %
                  </span>
                </div>
              )}
              {summary.format === "paragraph" ? (
                <div className="paragraph-summary">
                  {typeof summary.content === "string" ? (
                    <p>{summary.content}</p>
                  ) : (
                    summary.content.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  )}
                </div>
              ) : summary.format === "bullets" ? (
                <ul>
                  {summary.content.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              ) : (
                summary.content.map((item, index) => (
                  <p key={index}>
                    <strong>
                      {summary.format === "insights" ? "Insight" : "Theme"}{" "}
                      {index + 1}:
                    </strong>{" "}
                    {item}
                  </p>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          &copy; 2025 GenAI Summary Bot - Powered by LangChain & RAG
          Architecture
        </p>
      </footer>

      {notification.show && (
        <div
          className="notification"
          style={{
            background: notification.type === "error" ? "#e53e3e" : "#48bb78",
          }}
        >
          <i
            className={`fas ${
              notification.type === "error"
                ? "fa-exclamation-circle"
                : "fa-check-circle"
            }`}
          ></i>
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
