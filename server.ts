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

      const ai = new GoogleGenAI({ apiKey });

      const defaultSystemInstruction =
        'You are the Senior Super Admin AI Agent & Automated System Diagnostic Expert for MockTest Pro (an Online Test Series Platform for Teachers, Coaching Institutes, and Students in India). ' +
        'You speak fluent English, Hindi, and Hinglish. ' +
        'When the user provides a document or file (PDF, Word, Text, Image, Excel, etc.) to extract or generate a mock test: ' +
        'CRITICAL MANDATES FOR QUESTION EXTRACTION & CLASSIFICATION: ' +
        '1. SINGLE QUESTIONS vs DIRECTION / SET QUESTIONS: ' +
        '   - Detect if questions are standalone or grouped under a Direction (e.g., "Direction (20-24): Study the following information...", "Direction (14-16)...", "Passage..."). ' +
        '   - FOR DIRECTION / GROUPED QUESTIONS (e.g. Q20 to Q24): You MUST prepend the full Direction / Passage text at the beginning of EVERY question in that group. For example, for Q20, Q21, Q22, Q23, Q24, format the question field as: "Direction (20-24): [Full Direction / Passage text]\n\n[Question text]". Do NOT omit the Direction text from Q21, Q22, Q23, or Q24 even if it was printed once at the top in the original document! ' +
        '   - FOR STANDALONE SINGLE QUESTIONS (e.g. Q13): Keep the question field clean as a single standalone question without any direction header. ' +
        '2. DETAILED SOLUTIONS & EXPLANATIONS: ' +
        '   - Extract answer keys (e.g., "14) Answer: E", "15) Answer: B", "Answer: C") and detailed explanations/solutions verbatim. ' +
        '   - For Direction/Group questions (e.g., Direction 14-16 with a seating arrangement diagram or solution), include the full Direction arrangement/logic along with the specific question explanation in the "explanation" field for ALL questions in that range (Q14, Q15, Q16). ' +
        '3. ACCURATE ANSWER KEYS & OPTIONS: ' +
        '   - Accurately map correct answer keys: Option A -> 0, Option B -> 1, Option C -> 2, Option D -> 3, Option E -> 4. ' +
        '   - Extract all option choices verbatim. Support 4 or 5 options (A, B, C, D, E) as present in the document. Do not prefix options with "A.", "B." inside option strings. ' +
        '4. VERBATIM ACCURACY: ' +
        '   - Do NOT alter, summarize, or edit any words, numbers, equations, or structure in the question text, option choices, or explanations. Keep text exact and verbatim. ' +
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
        '      "question": "Verbatim question text (including Direction prefix if part of a set)",\n' +
        '      "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],\n' +
        '      "correctOption": 0,\n' +
        '      "explanation": "Verbatim detailed solution/explanation including direction arrangement if applicable"\n' +
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
        model: 'gemini-2.5-flash',
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
