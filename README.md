# AI-Powered Smart Healthcare Management System

This project is a localized, AI-powered healthcare management system built with React, Vite, Express, and Tailwind CSS. It features full support for English and Kannada, real-time AI analysis, and a professional medical UI.

## Local Setup Instructions

Follow these steps to run the application locally on your machine using VSCode.

### 1. Prerequisites

- **Node.js**: Ensure you have Node.js (v18 or higher) installed.
- **npm**: npm is usually installed with Node.js.

### 2. Clone/Download the Project

If you haven't already, download the project files and open the root directory in VSCode.

### 3. Install Dependencies

Open a terminal in VSCode and run:

```bash
npm install
```

### 4. Configure Environment Variables

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and replace the placeholder values with your actual credentials.
   - Set `GEMINI_API_KEY` to your Google Gemini API key.
   - Set `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM` for SMTP email sending.
   - For Gmail, use a 16-character App Password from Google Account Security.
   - If your email account is not Gmail, set `EMAIL_SERVICE` to the appropriate SMTP service name.

   You can get a Gemini API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### 5. Start the Development Server

Run the following command to start both the Express backend and the Vite frontend:

```bash
npm run dev
```

The application will be available at:
**http://localhost:3000**

## Project Structure

- `src/`: Contains the React frontend logic, components, and pages.
- `server.js`: The Express backend that serves the frontend and manages API routes.
- `src/utils/aiEngine.js`: Simulation logic for the AI features (Image analysis and Chat).
- `src/utils/translations.js`: Multilingual support (English, Spanish, Hindi, French, Kannada).
- `vite.config.js`: Configuration for the Vite build tool and development server.

## Available Scripts

- `npm run dev`: Starts the development server on port 3000.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run clean`: Removes the `dist` folder.
