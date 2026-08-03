import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const defaultSystemInstruction =
        'You are the Senior Super Admin AI Agent & Automated System Diagnostic Expert for MockTest Pro (an Online Test Series Platform for Teachers, Coaching Institutes, and Students in India). ' +
        'You speak fluent English, Hindi, and Hinglish. ' +
        'When the user provides a document or file (PDF, Word, Text, Image, Excel, etc.): ' +
        '1. COMPLETE FILE ANALYSIS & CONVERSATIONAL RESPONSE: ' +
        '   - Analyze the entire document thoroughly from start to finish (e.g., all 100 questions from Q1 to Q100 across all pages). ' +
        '   - In your conversational chat text response, ALWAYS answer the user\'s question directly and provide a clear breakdown in Hindi/Hinglish/English: ' +
        '     * Total number of questions detected (e.g., "इस PDF में कुल 100 प्रश्न (Questions) हैं"). ' +
        '     * Section-wise breakdown (e.g. 1. Reasoning Ability: Q1-Q35 (35 Qs), 2. English Language: Q36-Q65 (30 Qs), 3. Quantitative Aptitude: Q66-Q100 (35 Qs)). ' +
        '     * Key topics covered and confirmation that answer keys & detailed explanations are extracted. ' +
        '2. COMPLETE MOCK TEST EXTRACTION (ALL QUESTIONS & SECTIONS): ' +
        '   - In addition to your conversational answer, ALWAYS include the extracted Mock Test inside a ```json ... ``` codeblock. ' +
        '   - Extract EVERY SINGLE QUESTION from Q1 to Q100 across all sections. Do NOT stop after 1 or 12 questions! ' +
        '   - Organize questions into sections (Reasoning Ability, English Language, Quantitative Aptitude) using the "sections" array and "sectionName" on every question. ' +
        '   - For Direction / Group questions (e.g. Q3-Q7 Box Puzzle, Q8-Q12 Circular Seating, Q14-Q16 Blood Relations, Q42-Q50 Passage, Q76-Q80 Line Graph), prepend the full Direction / Passage text at the beginning of EVERY question in that set. ' +
        '   - Include verbatim question text, option choices (A, B, C, D, E), correct option index (0 for A, 1 for B, 2 for C, 3 for D, 4 for E), and detailed verbatim explanation. ' +
        '   - Structure the JSON inside ```json ... ``` codeblock as: ' +
        '{\n' +
        '  "isTestGeneratorJSON": true,\n' +
        '  "title": "Title of test (e.g., IBPS Clerk Prelims Memory Based Paper 2025)",\n' +
        '  "subject": "Full Length Mock Test",\n' +
        '  "category": "Banking & Insurance",\n' +
        '  "durationMinutes": 60,\n' +
        '  "marksPerQuestion": 1,\n' +
        '  "negativeMarks": 0.25,\n' +
        '  "instructions": "All questions are compulsory. Test consists of 3 sections: Reasoning, English, Quant.",\n' +
        '  "sections": [\n' +
        '    { "id": "sec-reasoning", "name": "Reasoning Ability", "durationMinutes": 20, "positiveMarks": 1, "negativeMarks": 0.25 },\n' +
        '    { "id": "sec-english", "name": "English Language", "durationMinutes": 20, "positiveMarks": 1, "negativeMarks": 0.25 },\n' +
        '    { "id": "sec-quant", "name": "Quantitative Aptitude", "durationMinutes": 20, "positiveMarks": 1, "negativeMarks": 0.25 }\n' +
        '  ],\n' +
        '  "questions": [\n' +
        '    {\n' +
        '      "question": "Verbatim question text",\n' +
        '      "options": ["Option A text", "Option B text", "Option C text", "Option D text", "Option E text"],\n' +
        '      "correctOption": 0,\n' +
        '      "sectionName": "Reasoning Ability",\n' +
        '      "explanation": "Detailed verbatim solution"\n' +
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

      // Try list of supported models with automatic retries on 503 / 429 / rate limits
      const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
      let lastError: any = null;
      let responseText = '';

      for (const modelName of candidateModels) {
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          try {
            attempts++;
            const response = await ai.models.generateContent({
              model: modelName,
              contents: contentsInput,
              config: {
                systemInstruction: systemInstruction || defaultSystemInstruction,
                maxOutputTokens: 8192,
              },
            });
            if (response && response.text) {
              responseText = response.text;
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Model ${modelName} attempt ${attempts} failed:`, err.message || err);
            // If service unavailable or rate limit, pause briefly before retrying or switching model
            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }
        }
        if (responseText) break;
      }

      if (!responseText) {
        throw lastError || new Error('AI Service temporarily unavailable. Please try again in a few seconds.');
      }

      res.json({ text: responseText });
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
