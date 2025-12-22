#!/usr/bin/env node
/**
 * Leonardo AI MCP Server
 *
 * Provides image generation capabilities via Leonardo AI API
 * Documentation: https://docs.leonardo.ai/reference
 *
 * Environment variables:
 * - LEONARDO_API_KEY: Your Leonardo AI API key
 * - PORT: Server port (default: 3025)
 */

const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const LEONARDO_API_BASE = 'https://cloud.leonardo.ai/api/rest/v1';
const API_KEY = process.env.LEONARDO_API_KEY;

// Helper to make Leonardo API requests
async function leonardoRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `Bearer ${API_KEY}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${LEONARDO_API_BASE}${endpoint}`, options);
  return response.json();
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'leonardo-ai-mcp',
    apiKeyConfigured: !!API_KEY
  });
});

// List available models
app.get('/models', async (req, res) => {
  try {
    const result = await leonardoRequest('/platformModels');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user info and credits
app.get('/user', async (req, res) => {
  try {
    const result = await leonardoRequest('/me');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create image generation
app.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      numImages = 1,
      modelId = 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Phoenix
      presetStyle = 'DYNAMIC',
      alchemy = true,
      photoReal = false,
      photoRealVersion = 'v2'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const generationBody = {
      prompt,
      negative_prompt: negativePrompt,
      width,
      height,
      num_images: numImages,
      modelId,
      presetStyle,
      alchemy,
      photoReal,
      photoRealVersion
    };

    console.log('Starting generation with:', { prompt, width, height, modelId });

    const result = await leonardoRequest('/generations', 'POST', generationBody);

    if (result.sdGenerationJob) {
      res.json({
        success: true,
        generationId: result.sdGenerationJob.generationId,
        message: 'Generation started. Use /generation/:id to check status.'
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get generation status/results
app.get('/generation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await leonardoRequest(`/generations/${id}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate and wait for result (convenience endpoint)
app.post('/generate-and-wait', async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      numImages = 1,
      modelId = 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Phoenix
      presetStyle = 'DYNAMIC',
      alchemy = true,
      photoReal = false,
      photoRealVersion = 'v2',
      maxWaitTime = 120000 // 2 minutes max
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Start generation
    const generationBody = {
      prompt,
      negative_prompt: negativePrompt,
      width,
      height,
      num_images: numImages,
      modelId,
      presetStyle,
      alchemy,
      photoReal,
      photoRealVersion
    };

    console.log('Starting generation and waiting for result:', { prompt });

    const startResult = await leonardoRequest('/generations', 'POST', generationBody);

    if (!startResult.sdGenerationJob?.generationId) {
      return res.status(500).json({ error: 'Failed to start generation', details: startResult });
    }

    const generationId = startResult.sdGenerationJob.generationId;
    console.log(`Generation started with ID: ${generationId}`);

    // Poll for completion
    const startTime = Date.now();
    const pollInterval = 3000; // 3 seconds

    while (Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResult = await leonardoRequest(`/generations/${generationId}`);

      if (statusResult.generations_by_pk?.status === 'COMPLETE') {
        console.log('Generation complete!');
        res.json({
          success: true,
          generationId,
          images: statusResult.generations_by_pk.generated_images,
          generation: statusResult.generations_by_pk
        });
        return;
      }

      if (statusResult.generations_by_pk?.status === 'FAILED') {
        return res.status(500).json({
          error: 'Generation failed',
          details: statusResult.generations_by_pk
        });
      }

      console.log(`Status: ${statusResult.generations_by_pk?.status || 'pending'}...`);
    }

    res.status(408).json({
      error: 'Generation timed out',
      generationId,
      message: 'Use /generation/:id to check status manually'
    });

  } catch (error) {
    console.error('Generate and wait error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's generations history
app.get('/generations', async (req, res) => {
  try {
    const { offset = 0, limit = 10 } = req.query;
    const result = await leonardoRequest(`/generations/user/${API_KEY}?offset=${offset}&limit=${limit}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a generation
app.delete('/generation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await leonardoRequest(`/generations/${id}`, 'DELETE');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3025;
app.listen(PORT, () => {
  console.log(`Leonardo AI MCP Server running on port ${PORT}`);
  console.log(`API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
  if (!API_KEY) {
    console.log('Warning: LEONARDO_API_KEY not set. Set it in your .env file.');
  }
});
