import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Super Admin Assistant & Diagnostic Endpoint
  app.post('/api/ai-assistant', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY environment variable is missing on server. Please check your AI Studio secrets configuration.',
        });
      }

      const { prompt, context, systemInstruction, fileData } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt string is required.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const defaultSystemInstruction =
        'You are the Senior Super Admin AI Agent & Automated System Diagnostic Expert for MockTest Pro (an Online Test Series Platform for Teachers, Coaching Institutes, and Students in India). ' +
        'You speak fluent English, Hindi, and Hinglish. ' +
        'When the user provides a document or file (PDF, Word, Text, Image, Excel, etc.) to extract a mock test from: ' +
        'CRITICAL MANDATE: You MUST extract all questions, options, correct answer keys, and detailed explanations/solutions EXACTLY VERBATIM as written in the provided document without altering, changing, paraphrasing, summarizing, or modifying any words or formatting. Keep the exact text verbatim as provided in the file. ' +
        'When returning a generated/extracted Mock Test JSON, structure it inside a ```json ... ``` codeblock as: ' +
        '{\n' +
        '  "isTestGeneratorJSON": true,\n' +
        '  "title": "Title of test from file or topic",\n' +
        '  "subject": "Subject Name",\n' +
        '  "category": "Competitive Exam",\n' +
        '  "durationMinutes": 60,\n' +
        '  "marksPerQuestion": 2,\n' +
        '  "negativeMarks": 0.5,\n' +
        '  "instructions": "All questions are compulsory.",\n' +
        '  "questions": [\n' +
        '    {\n' +
        '      "question": "Verbatim question text from file",\n' +
        '      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],\n' +
        '      "correctOption": 0,\n' +
        '      "explanation": "Verbatim detailed solution/explanation from file if available, else empty string"\n' +
        '    }\n' +
        '  ]\n' +
        '}\n';

      const formattedPrompt = `
[SYSTEM STATE CONTEXT]
${JSON.stringify(context || {}, null, 2)}

[SUPER ADMIN REQUEST]
${prompt}
      `;

      let contentsInput: any;
      if (fileData && fileData.base64 && fileData.mimeType) {
        contentsInput = [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          },
          { text: formattedPrompt },
        ];
      } else {
        contentsInput = formattedPrompt;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contentsInput,
        config: {
          systemInstruction: systemInstruction || defaultSystemInstruction,
        },
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Gemini API Error in /api/ai-assistant:', err);
      res.status(500).json({ error: err.message || 'Error processing request with Gemini AI' });
    }
  });

  // Vite middleware setup for Development vs Production static server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
