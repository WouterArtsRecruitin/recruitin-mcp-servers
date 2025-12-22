#!/usr/bin/env node
// Google AI Studio MCP Bridge
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

app.post('/generate', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(req.body.prompt);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/list-models', async (req, res) => {
  res.json({
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' }
    ]
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Google AI MCP running on port ${PORT}`);
});
