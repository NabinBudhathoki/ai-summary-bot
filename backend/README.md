# AI Summary Bot - Backend

Backend service for AI-powered text and URL summarization using OpenAI's GPT models.

## Features

- **Text Summarization**: Summarize any text content with customizable formats and lengths
- **URL Summarization**: Extract and summarize content from web URLs
- **Multiple Output Formats**: Support for paragraph, bullet points, insights, and themes
- **Flexible Length Options**: Short, medium, and long summaries
- **Rate Limiting**: Built-in protection against API abuse
- **Text Sanitization**: Automatic handling of smart quotes, special characters, and formatting
- **CORS Support**: Cross-origin requests enabled for frontend integration
- **Security Headers**: Helmet.js integration for enhanced security

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI Service**: OpenAI GPT API
- **Web Scraping**: Cheerio + Axios
- **Security**: Helmet.js, CORS
- **Development**: Nodemon, ESLint

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### 1. Text Summarization

**POST** `/summary/text`

Summarize provided text content.

**Request Body:**

```json
{
  "text": "Your text content here...",
  "summaryType": "summary",
  "format": "paragraph",
  "length": "medium"
}
```

**Parameters:**

- `text` (required): The text content to summarize
- `summaryType` (optional): Type of summary (default: "summary")
- `format` (optional): Output format - "paragraph", "bullets", "insights", or "themes" (default: "paragraph")
- `length` (optional): Summary length - "short", "medium", or "long" (default: "medium")

### 2. URL Summarization

**POST** `/summary/url`

Extract and summarize content from a web URL.

**Request Body:**

```json
{
  "url": "https://example.com/article",
  "summaryType": "summary",
  "format": "paragraph",
  "length": "medium"
}
```

**Parameters:**

- `url` (required): The URL to extract and summarize content from
- `summaryType` (optional): Type of summary (default: "summary")
- `format` (optional): Output format - "paragraph", "bullets", "insights", or "themes" (default: "paragraph")
- `length` (optional): Summary length - "short", "medium", or "long" (default: "medium")

## Response Format

**Success Response (200):**

```json
{
  "success": true,
  "summary": "The generated summary content...",
  "metadata": {
    "format": "paragraph",
    "length": "medium",
    "originalLength": 1500,
    "summaryLength": 250
  }
}
```

**Error Response (4xx/5xx):**

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Project Structure

```
backend/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── config.ts           # Configuration management
│   ├── controllers/
│   │   └── summary.controller.ts  # Summary logic handlers
│   ├── routes/
│   │   └── summary.routes.ts      # API route definitions
│   ├── services/
│   │   ├── openai.service.ts      # OpenAI API integration
│   │   └── urlFetcher.service.ts  # URL content extraction
│   └── utils/
│       └── rateLimiter.ts         # Rate limiting middleware
├── package.json
├── tsconfig.json
└── README.md
```

## Development

1. Start the development server:

```bash
npm run dev
```

2. The server will start on `http://localhost:3000`

3. API will be available at `http://localhost:3000/api/v1`

## Testing

For comprehensive API testing instructions, see [API_TESTING.md](./API_TESTING.md).

Quick test with curl:

```bash
# Test text summarization
curl -X POST http://localhost:3000/api/v1/summary/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Your sample text here..."}'

# Test URL summarization
curl -X POST http://localhost:3000/api/v1/summary/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Rate Limiting

The API includes rate limiting to prevent abuse:

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Returns 429 status code when limit exceeded

## Error Handling

The API includes comprehensive error handling for:

- Invalid requests (400)
- Authentication failures (401)
- Rate limit exceeded (429)
- Internal server errors (500)
- OpenAI API errors
- URL fetching failures

## Security Features

- **Helmet.js**: Security headers for common vulnerabilities
- **CORS**: Configurable cross-origin request handling
- **Input Sanitization**: Automatic cleaning of special characters
- **Rate Limiting**: Protection against API abuse
- **Environment Variables**: Secure configuration management

## Environment Variables

| Variable                  | Description             | Default         |
| ------------------------- | ----------------------- | --------------- |
| `PORT`                    | Server port             | 3000            |
| `NODE_ENV`                | Environment mode        | development     |
| `OPENAI_API_KEY`          | OpenAI API key          | Required        |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window       | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100             |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting: `npm run lint`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
