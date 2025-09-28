# Migration to GitHub AI Model

This document summarizes the changes made to migrate from using the OpenAI API directly to using the GitHub AI model inference endpoint.

## Changes Made

1. **Added Required Packages**
   - Added `@azure-rest/ai-inference`
   - Added `@azure/core-auth`
   - Added `@azure/core-sse`

2. **Created GitHub AI Service**
   - Created `src/services/githubAiService.js` to replace `openaiService.js`
   - Used Azure SDK for AI inference to communicate with GitHub's endpoint
   - Maintained same interface for seamless integration with existing components

3. **Updated Views**
   - Updated `FitnessPlan.vue` to use `githubAiService` instead of `openaiService`
   - Updated `RelaxationRoutines.vue` to use `githubAiService` instead of `openaiService`

4. **Environment Configuration**
   - Added `.env` entry for GitHub token (`VITE_GITHUB_TOKEN`)
   - Set up process environment variable (`GITHUB_TOKEN`)

5. **Documentation**
   - Updated README with GitHub AI model integration instructions
   - Added new troubleshooting steps for GitHub AI model
   - Documented advantages of using GitHub AI model

6. **Testing**
   - Added test script (`src/test-github-ai.js`) to verify GitHub AI integration
   - Added npm script `test-github-ai` to package.json

## Advantages of the Migration

1. **Authentication**
   - Uses GitHub token for authentication, which may be more convenient in a GitHub-centric workflow

2. **Cost Efficiency**
   - May offer better pricing or included quota with GitHub accounts

3. **Feature Parity**
   - Still uses the powerful GPT-4.1 model
   - Maintains same recommendation structure and quality

4. **Integration**
   - More seamless integration with GitHub ecosystem
   - Potential for better integration with GitHub Codespaces and other GitHub development tools

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set GitHub token:**
   ```bash
   # Windows
   set GITHUB_TOKEN=your-github-token-goes-here
   
   # macOS/Linux
   export GITHUB_TOKEN=your-github-token-goes-here
   ```

3. **Add token to .env file:**
   ```
   VITE_GITHUB_TOKEN=your-github-token-goes-here
   ```

4. **Run test to verify integration:**
   ```bash
   npm run test-github-ai
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Code Changes

### Previous OpenAI API Call

```javascript
const response = await fetch(this.apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`
  },
  body: JSON.stringify({
    model: 'gpt-4-turbo',
    messages: messages,
    temperature: 0.7,
    max_tokens: 2000
  })
});
```

### New GitHub AI Model Call

```javascript
const client = ModelClient(
  this.endpoint,
  new AzureKeyCredential(this.token),
);

const response = await client.path("/chat/completions").post({
  body: {
    messages: messages,
    temperature: 0.7,
    top_p: 1.0,
    model: this.model
  }
});
```

## Troubleshooting

If you encounter issues with the GitHub AI model integration:

1. Verify your GitHub token has the necessary permissions
2. Check that the token is correctly set in both environment and .env file
3. Verify network connectivity to the GitHub AI model endpoint
4. Check console for detailed error messages
5. Run the test script to isolate issues 