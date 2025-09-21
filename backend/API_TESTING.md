# API Testing Guide

This guide provides detailed instructions for testing all the API endpoints using Postman or similar tools.

## Base URL

```
http://localhost:3000/api/v1
```

## 1. Text Summarization

### Endpoint

```
POST /summary/text
```

### Request Body

```json
{
  "text": "Your text content here. This can be multiple paragraphs with various characters like smart quotes, em dashes, and other problematic characters that will be automatically sanitized.",
  "summaryType": "summary",
  "format": "paragraph",
  "length": "medium"
}
```

### Parameters

- `text` (required): The text content to summarize
- `summaryType` (optional): Type of summary (default: "summary")
- `format` (optional): Output format - "paragraph", "bullets", "insights", or "themes" (default: "paragraph")
- `length` (optional): Summary length - "short", "medium", or "long" (default: "medium")

### Example Request (Bullet Format)

```json
{
  "text": "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of \"intelligent agents\": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. Colloquially, the term \"artificial intelligence\" is often used to describe machines that mimic \"cognitive\" functions that humans associate with the human mind, such as \"learning\" and \"problem solving\". As machines become increasingly capable, tasks considered to require \"intelligence\" are often removed from the definition of AI, a phenomenon known as the AI effect.",
  "format": "bullets",
  "length": "short"
}
```

### Success Response

```json
{
  "success": true,
  "summary": "Generated summary text...",
  "summaryType": "summary",
  "format": "bullets",
  "length": "short",
  "originalLength": 756,
  "summaryLength": 245
}
```

## 2. URL Summarization ⭐ NEW!

### Endpoint

```
POST /summary/url
```

### Request Body

```json
{
  "url": "https://example.com/article",
  "summaryType": "summary",
  "format": "paragraph",
  "length": "medium"
}
```

### Parameters

- `url` (required): The URL to fetch and summarize content from
- `summaryType` (optional): Type of summary (default: "summary")
- `format` (optional): Output format - "paragraph", "bullets", "insights", or "themes" (default: "paragraph")
- `length` (optional): Summary length - "short", "medium", or "long" (default: "medium")

### Example Request (Insights Format)

```json
{
  "url": "https://en.wikipedia.org/wiki/Machine_learning",
  "format": "insights",
  "length": "medium"
}
```

### Success Response

```json
{
  "success": true,
  "summary": "**Key Insights:**\n• **Core Concept**: Machine learning is a subset of AI that enables systems to learn and improve from experience...",
  "url": "https://en.wikipedia.org/wiki/Machine_learning",
  "title": "Machine learning - Wikipedia",
  "summaryType": "summary",
  "format": "insights",
  "length": "medium",
  "originalLength": 15420,
  "summaryLength": 892,
  "metadata": {
    "fetchedAt": "2024-01-15T10:30:45.123Z",
    "contentPreview": "Machine learning (ML) is a field of artificial intelligence that uses statistical techniques to give computer systems..."
  }
}
```

### Rate Limiting

- **Limit**: 10 requests per 15 minutes per IP address
- **Headers**: Check `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers
- **Error Response** (429):

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Maximum 10 requests per 15 minutes.",
  "retryAfter": 300
}
```

### URL Validation Errors

```json
{
  "error": "Invalid URL",
  "message": "Only HTTP and HTTPS URLs are supported"
}
```

```json
{
  "error": "Invalid URL",
  "message": "Local and internal URLs are not allowed"
}
```

### Content Fetch Errors

```json
{
  "error": "URL fetch failed",
  "message": "Request timeout - the website took too long to respond"
}
```

```json
{
  "error": "URL fetch failed",
  "message": "Access forbidden (403) - the website blocks automated requests"
}
```

## 3. AI Text Detection

### Endpoint

```
POST /ai-detection/detect
```

### Request Body

```json
{
  "text": "Text to analyze for AI generation patterns"
}
```

### Example Request

```json
{
  "text": "The rapid advancement of artificial intelligence has revolutionized numerous industries and transformed the way we approach complex problem-solving tasks in modern society."
}
```

### Success Response

```json
{
  "success": true,
  "isAiGenerated": true,
  "confidence": 0.85,
  "analysis": {
    "indicators": [
      "High frequency of complex vocabulary",
      "Consistent sentence structure patterns",
      "Formal tone throughout"
    ],
    "humanLikeFeatures": ["Some natural flow variations"]
  },
  "textLength": 150
}
```

## 4. Study Guide Generation

### Endpoint

```
POST /study-guide/generate
```

### Request Body

```json
{
  "subject": "Machine Learning",
  "topics": ["supervised learning", "neural networks", "classification"],
  "difficulty": "intermediate",
  "includeExamples": true
}
```

### Success Response

```json
{
  "success": true,
  "studyGuide": {
    "title": "Machine Learning Study Guide",
    "difficulty": "intermediate",
    "sections": [
      {
        "topic": "Supervised Learning",
        "content": "Detailed explanation...",
        "examples": ["Linear regression example..."]
      }
    ]
  },
  "generatedAt": "2024-01-15T10:30:45.123Z"
}
```

## Testing with Postman

### 1. Set up Base URL

- Create a new collection in Postman
- Set the collection variable `baseUrl` to `http://localhost:3000/api/v1`

### 2. Create Requests

1. **Text Summary**: `POST {{baseUrl}}/summary/text`
2. **URL Summary**: `POST {{baseUrl}}/summary/url`
3. **AI Detection**: `POST {{baseUrl}}/ai-detection/detect`
4. **Study Guide**: `POST {{baseUrl}}/study-guide/generate`

### 3. Test Different Formats

Try different combinations of `format` and `length` parameters:

**Formats:**

- `paragraph`: Traditional paragraph summary
- `bullets`: Bullet-point format
- `insights`: Key insights and takeaways
- `themes`: Main themes and topics

**Lengths:**

- `short`: Concise summary
- `medium`: Balanced detail level
- `long`: Comprehensive summary

### 4. Test URL Endpoint

Try these test URLs:

- Wikipedia articles: `https://en.wikipedia.org/wiki/Artificial_intelligence`
- News articles: Any public news article URL
- Blog posts: Any publicly accessible blog post

### 5. Error Testing

Test error scenarios:

- Invalid URLs
- Missing required fields
- Invalid format/length values
- Rate limit testing (make 11+ requests in 15 minutes)

## Environment Variables Required

Make sure these are set in your `.env` file:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

## Running the Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Common Issues

1. **OpenAI API Key**: Ensure your API key is valid and has sufficient credits
2. **CORS**: If testing from a browser, ensure CORS is properly configured
3. **Rate Limiting**: URL endpoint has rate limiting - wait if you hit the limit
4. **URL Access**: Some websites block automated requests - try different URLs if one fails
5. **Timeout**: Large web pages may take time to fetch - increase timeout if needed
