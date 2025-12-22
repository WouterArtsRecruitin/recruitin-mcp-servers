#!/usr/bin/env node
/**
 * Leonardo AI MCP Server - SDK Edition
 *
 * Complete MCP server for Leonardo AI image generation using the official SDK.
 * Includes webhook support for async notifications when generations complete.
 *
 * Features:
 * - Official Leonardo TypeScript SDK integration
 * - Image generation with all parameters
 * - Webhook callbacks for generation completion
 * - Polling with automatic webhook trigger
 * - Christmas recruiter image templates
 * - Integration-ready for Pipedrive/recruitment workflows
 *
 * Environment:
 *   LEONARDO_API_KEY - Your Leonardo AI API key (required)
 *   PORT - Server port (default: 3025)
 *   WEBHOOK_SECRET - Optional secret for webhook verification
 *
 * @author RecruitIn Automation Hub
 */

const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// Configuration
const API_KEY = process.env.LEONARDO_API_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'recruitin-leonardo-webhook';
const LEONARDO_API_BASE = 'https://cloud.leonardo.ai/api/rest/v1';

// In-memory store for active generations and webhooks
const activeGenerations = new Map();
const webhookSubscriptions = new Map();

// Leonardo AI Image Model IDs
const MODELS = {
  PHOENIX: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
  KINO_XL: 'aa77f04e-3eec-4034-9c07-d0f619684628',
  DIFFUSION_XL: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
  LIGHTNING_XL: '5c232a9e-9061-4777-980a-ddc8e65647c6',
  VISION_XL: 'b75d62f2-6dba-4a4a-98b3-c7d1a1c6c3e6',
  ANIME_XL: '1e60896f-3c26-4296-8ecc-53e2afecc132'
};

// Kling Video Models
const KLING_MODELS = {
  KLING_2_5_TURBO: 'Kling2_5',      // Kling 2.5 Turbo - Fast generation
  KLING_2_1_PRO: 'KLING2_1',        // Kling 2.1 Pro - Higher quality, needs start frame
  KLING_2_6_PRO: 'Kling2_6'         // Kling 2.6 Pro - Latest model (if available)
};

// Kling Video Resolutions
const KLING_RESOLUTIONS = {
  LANDSCAPE: { width: 1920, height: 1080, ratio: '16:9' },
  PORTRAIT: { width: 1080, height: 1920, ratio: '9:16' },
  SQUARE: { width: 1440, height: 1440, ratio: '1:1' }
};

// Video generation templates for recruitment
const VIDEO_TEMPLATES = {
  recruiter_intro: {
    prompt: 'Professional recruiter in modern office, welcoming gesture, warm smile, natural movement, corporate setting, soft lighting, 4K quality',
    duration: 5
  },
  christmas_greeting: {
    prompt: 'Recruiter in Christmas outfit waving hello, festive office background with Christmas tree, warm holiday lighting, friendly professional demeanor, subtle snow effect',
    duration: 5
  },
  office_tour: {
    prompt: 'Smooth camera movement through modern tech office, open workspace, employees collaborating, natural lighting, professional atmosphere, cinematic quality',
    duration: 10
  },
  job_celebration: {
    prompt: 'Happy professional celebrating new job, confetti, office celebration, colleagues applauding, joyful atmosphere, warm lighting',
    duration: 5
  }
};

// Preset styles
const PRESET_STYLES = [
  'ANIME', 'BOKEH', 'CINEMATIC', 'CINEMATIC_CLOSEUP', 'CREATIVE',
  'DYNAMIC', 'ENVIRONMENT', 'FASHION', 'FILM', 'FOOD', 'GENERAL',
  'HDR', 'ILLUSTRATION', 'LEONARDO', 'LONG_EXPOSURE', 'MACRO',
  'MINIMALISTIC', 'MONOCHROME', 'MOODY', 'NONE', 'NEUTRAL',
  'PHOTOGRAPHY', 'PORTRAIT', 'PRO', 'RAYTRACED', 'RENDER_3D',
  'RETRO', 'SKETCH_BW', 'SKETCH_COLOR', 'STOCK_PHOTO', 'VIBRANT',
  'UNPROCESSED'
];

// Christmas recruiter prompt templates
const CHRISTMAS_TEMPLATES = {
  professional: {
    prompt: `Professional recruiter wearing festive Christmas outfit, Santa hat, red and white business attire with subtle holiday decorations, holding a tablet or laptop, modern office setting decorated for Christmas with a Christmas tree in the background, warm lighting, professional corporate photography style, friendly smile, looking confident and approachable, high quality, 8k, detailed`,
    negativePrompt: `blurry, low quality, distorted, ugly, deformed, cartoon, anime, illustration, painting, drawing, text, watermark, signature, bad anatomy, extra limbs`
  },
  casual: {
    prompt: `Friendly recruiter in cozy Christmas sweater with festive patterns, wearing a Santa hat, sitting at a modern desk with Christmas decorations, laptop open, cup of hot cocoa, warm office environment with fairy lights and Christmas tree, natural lighting, candid professional photography, genuine warm smile, inviting atmosphere`,
    negativePrompt: `blurry, low quality, distorted, ugly, deformed, cartoon, anime, illustration, text, watermark`
  },
  creative: {
    prompt: `Stylish HR recruiter dressed as a modern Santa Claus, red blazer with white fur trim, elegant Christmas accessories, standing in a contemporary office space with minimalist Christmas decorations, holding a resume or contract, professional photography, magazine quality, warm golden hour lighting, bokeh background with Christmas lights, confident pose, welcoming expression`,
    negativePrompt: `blurry, low quality, distorted, ugly, cartoon, anime, illustration, text, watermark, old fashioned, cluttered`
  },
  dutch: {
    prompt: `Nederlandse recruiter in feestelijke kerstoutfit, kerstmuts, rood-wit zakelijk pak, modern kantoor met kerstboom en Hollandse accenten, warme sfeerverlichting, professionele fotografie, vriendelijke uitstraling, zelfverzekerd, hoge kwaliteit foto`,
    negativePrompt: `wazig, lage kwaliteit, vervormd, lelijk, cartoon, anime, tekening, tekst, watermerk`
  }
};

// Helper: Make Leonardo API request
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
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Leonardo API error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

// Helper: Send webhook notification
async function sendWebhook(webhookUrl, payload, secret = WEBHOOK_SECRET) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret,
        'X-Leonardo-Event': 'generation.complete'
      },
      body: JSON.stringify(payload)
    });

    console.log(`Webhook sent to ${webhookUrl}: ${response.status}`);
    return { success: true, status: response.status };
  } catch (error) {
    console.error(`Webhook failed for ${webhookUrl}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Helper: Poll generation and trigger webhook
async function pollAndNotify(generationId, webhookUrl, pollInterval = 5000, maxAttempts = 60) {
  let attempts = 0;

  const poll = async () => {
    attempts++;
    try {
      const result = await leonardoRequest(`/generations/${generationId}`);
      const generation = result.generations_by_pk;

      if (generation?.status === 'COMPLETE') {
        console.log(`Generation ${generationId} complete!`);

        // Send webhook
        if (webhookUrl) {
          await sendWebhook(webhookUrl, {
            event: 'generation.complete',
            generationId,
            status: 'COMPLETE',
            images: generation.generated_images,
            metadata: {
              prompt: generation.prompt,
              modelId: generation.modelId,
              width: generation.imageWidth,
              height: generation.imageHeight,
              createdAt: generation.createdAt
            }
          });
        }

        // Clean up
        activeGenerations.delete(generationId);
        return generation;
      }

      if (generation?.status === 'FAILED') {
        console.log(`Generation ${generationId} failed`);
        activeGenerations.delete(generationId);

        if (webhookUrl) {
          await sendWebhook(webhookUrl, {
            event: 'generation.failed',
            generationId,
            status: 'FAILED',
            error: 'Generation failed'
          });
        }
        return generation;
      }

      // Continue polling
      if (attempts < maxAttempts) {
        setTimeout(poll, pollInterval);
      } else {
        console.log(`Generation ${generationId} timed out`);
        activeGenerations.delete(generationId);

        if (webhookUrl) {
          await sendWebhook(webhookUrl, {
            event: 'generation.timeout',
            generationId,
            status: 'TIMEOUT',
            error: 'Generation polling timed out'
          });
        }
      }
    } catch (error) {
      console.error(`Poll error for ${generationId}:`, error.message);
      if (attempts < maxAttempts) {
        setTimeout(poll, pollInterval);
      }
    }
  };

  // Start polling
  setTimeout(poll, pollInterval);
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'leonardo-sdk-mcp',
    version: '2.0.0',
    apiKeyConfigured: !!API_KEY,
    activeGenerations: activeGenerations.size,
    webhookSubscriptions: webhookSubscriptions.size
  });
});

// Get user info
app.get('/user', async (req, res) => {
  try {
    const result = await leonardoRequest('/me');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List platform models
app.get('/models', async (req, res) => {
  try {
    const result = await leonardoRequest('/platformModels');
    res.json({
      models: result.custom_models || [],
      presets: MODELS,
      styles: PRESET_STYLES
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List available Christmas templates
app.get('/templates/christmas', (req, res) => {
  res.json({
    templates: Object.keys(CHRISTMAS_TEMPLATES).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      prompt: CHRISTMAS_TEMPLATES[key].prompt.substring(0, 100) + '...'
    }))
  });
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
      modelId = MODELS.PHOENIX,
      presetStyle = 'DYNAMIC',
      alchemy = true,
      photoReal = true,
      photoRealVersion = 'v2',
      webhookUrl = null,
      template = null // Use a Christmas template
    } = req.body;

    // Use template if specified
    let finalPrompt = prompt;
    let finalNegativePrompt = negativePrompt;

    if (template && CHRISTMAS_TEMPLATES[template]) {
      finalPrompt = CHRISTMAS_TEMPLATES[template].prompt;
      finalNegativePrompt = CHRISTMAS_TEMPLATES[template].negativePrompt;
    }

    if (!finalPrompt) {
      return res.status(400).json({ error: 'Prompt is required (or use a template)' });
    }

    const generationBody = {
      prompt: finalPrompt,
      negative_prompt: finalNegativePrompt,
      width,
      height,
      num_images: numImages,
      modelId,
      presetStyle,
      alchemy,
      photoReal,
      photoRealVersion
    };

    console.log('Starting generation:', { prompt: finalPrompt.substring(0, 50) + '...', webhookUrl: !!webhookUrl });

    const result = await leonardoRequest('/generations', 'POST', generationBody);

    if (result.sdGenerationJob?.generationId) {
      const generationId = result.sdGenerationJob.generationId;

      // Store active generation
      activeGenerations.set(generationId, {
        startedAt: new Date(),
        webhookUrl,
        prompt: finalPrompt
      });

      // Start polling if webhook is configured
      if (webhookUrl) {
        pollAndNotify(generationId, webhookUrl);
      }

      res.json({
        success: true,
        generationId,
        message: webhookUrl
          ? 'Generation started. Webhook will be called when complete.'
          : 'Generation started. Use /generation/:id to check status.',
        estimatedTime: '30-120 seconds'
      });
    } else {
      res.status(500).json({ error: 'Failed to start generation', details: result });
    }
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Christmas recruiter image (convenience endpoint)
app.post('/generate/christmas-recruiter', async (req, res) => {
  try {
    const {
      style = 'professional',
      numImages = 2,
      webhookUrl = null,
      customPromptAddition = ''
    } = req.body;

    if (!CHRISTMAS_TEMPLATES[style]) {
      return res.status(400).json({
        error: `Invalid style. Available: ${Object.keys(CHRISTMAS_TEMPLATES).join(', ')}`
      });
    }

    const template = CHRISTMAS_TEMPLATES[style];
    const prompt = customPromptAddition
      ? `${template.prompt}, ${customPromptAddition}`
      : template.prompt;

    const generationBody = {
      prompt,
      negative_prompt: template.negativePrompt,
      width: 1024,
      height: 1024,
      num_images: numImages,
      modelId: MODELS.PHOENIX,
      presetStyle: 'DYNAMIC',
      alchemy: true,
      photoReal: true,
      photoRealVersion: 'v2'
    };

    console.log(`Generating Christmas recruiter (${style})...`);

    const result = await leonardoRequest('/generations', 'POST', generationBody);

    if (result.sdGenerationJob?.generationId) {
      const generationId = result.sdGenerationJob.generationId;

      activeGenerations.set(generationId, {
        startedAt: new Date(),
        webhookUrl,
        type: 'christmas-recruiter',
        style
      });

      if (webhookUrl) {
        pollAndNotify(generationId, webhookUrl);
      }

      res.json({
        success: true,
        generationId,
        style,
        message: webhookUrl
          ? 'Christmas recruiter generation started. Webhook will be called when complete.'
          : 'Generation started. Use /generation/:id to check status.'
      });
    } else {
      res.status(500).json({ error: 'Failed to start generation', details: result });
    }
  } catch (error) {
    console.error('Christmas generation error:', error);
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

// Generate and wait for result (synchronous)
app.post('/generate-sync', async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      numImages = 1,
      modelId = MODELS.PHOENIX,
      presetStyle = 'DYNAMIC',
      alchemy = true,
      photoReal = true,
      photoRealVersion = 'v2',
      template = null,
      maxWaitTime = 180000 // 3 minutes
    } = req.body;

    let finalPrompt = prompt;
    let finalNegativePrompt = negativePrompt;

    if (template && CHRISTMAS_TEMPLATES[template]) {
      finalPrompt = CHRISTMAS_TEMPLATES[template].prompt;
      finalNegativePrompt = CHRISTMAS_TEMPLATES[template].negativePrompt;
    }

    if (!finalPrompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Start generation
    const generationBody = {
      prompt: finalPrompt,
      negative_prompt: finalNegativePrompt,
      width,
      height,
      num_images: numImages,
      modelId,
      presetStyle,
      alchemy,
      photoReal,
      photoRealVersion
    };

    const startResult = await leonardoRequest('/generations', 'POST', generationBody);

    if (!startResult.sdGenerationJob?.generationId) {
      return res.status(500).json({ error: 'Failed to start generation', details: startResult });
    }

    const generationId = startResult.sdGenerationJob.generationId;
    console.log(`Sync generation started: ${generationId}`);

    // Poll for completion
    const startTime = Date.now();
    const pollInterval = 5000;

    while (Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResult = await leonardoRequest(`/generations/${generationId}`);
      const generation = statusResult.generations_by_pk;

      if (generation?.status === 'COMPLETE') {
        return res.json({
          success: true,
          generationId,
          images: generation.generated_images,
          metadata: {
            prompt: generation.prompt,
            width: generation.imageWidth,
            height: generation.imageHeight
          }
        });
      }

      if (generation?.status === 'FAILED') {
        return res.status(500).json({ error: 'Generation failed', generationId });
      }

      console.log(`Status: ${generation?.status || 'pending'}...`);
    }

    res.status(408).json({
      error: 'Generation timed out',
      generationId,
      message: 'Use /generation/:id to check status manually'
    });

  } catch (error) {
    console.error('Sync generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register webhook subscription
app.post('/webhooks/subscribe', (req, res) => {
  const { url, events = ['generation.complete'], secret } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Webhook URL is required' });
  }

  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  webhookSubscriptions.set(subscriptionId, {
    url,
    events,
    secret: secret || WEBHOOK_SECRET,
    createdAt: new Date()
  });

  res.json({
    success: true,
    subscriptionId,
    message: 'Webhook subscription created'
  });
});

// List webhook subscriptions
app.get('/webhooks', (req, res) => {
  const subscriptions = Array.from(webhookSubscriptions.entries()).map(([id, sub]) => ({
    id,
    url: sub.url,
    events: sub.events,
    createdAt: sub.createdAt
  }));

  res.json({ subscriptions });
});

// Delete webhook subscription
app.delete('/webhooks/:id', (req, res) => {
  const { id } = req.params;

  if (webhookSubscriptions.has(id)) {
    webhookSubscriptions.delete(id);
    res.json({ success: true, message: 'Subscription deleted' });
  } else {
    res.status(404).json({ error: 'Subscription not found' });
  }
});

// List active generations
app.get('/generations/active', (req, res) => {
  const active = Array.from(activeGenerations.entries()).map(([id, gen]) => ({
    generationId: id,
    startedAt: gen.startedAt,
    hasWebhook: !!gen.webhookUrl,
    type: gen.type || 'custom'
  }));

  res.json({ activeGenerations: active });
});

// Test webhook endpoint (for testing your webhook receiver)
app.post('/webhooks/test', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Webhook URL is required' });
  }

  const testPayload = {
    event: 'test',
    message: 'This is a test webhook from Leonardo MCP Server',
    timestamp: new Date().toISOString()
  };

  const result = await sendWebhook(url, testPayload);
  res.json(result);
});

// Prompt improvement endpoint
app.post('/prompt/improve', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await leonardoRequest('/prompt/improve', 'POST', { prompt });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Random prompt generation
app.post('/prompt/random', async (req, res) => {
  try {
    const result = await leonardoRequest('/prompt/random', 'POST', {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete generation
app.delete('/generation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await leonardoRequest(`/generations/${id}`, 'DELETE');
    activeGenerations.delete(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// KLING VIDEO GENERATION ENDPOINTS
// ============================================

// List Kling models and video templates
app.get('/video/models', (req, res) => {
  res.json({
    models: KLING_MODELS,
    resolutions: KLING_RESOLUTIONS,
    templates: Object.keys(VIDEO_TEMPLATES).map(key => ({
      id: key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      prompt: VIDEO_TEMPLATES[key].prompt.substring(0, 80) + '...',
      duration: VIDEO_TEMPLATES[key].duration
    })),
    supportedDurations: [5, 10]
  });
});

// Text-to-Video generation with Kling
app.post('/video/text-to-video', async (req, res) => {
  try {
    const {
      prompt,
      model = KLING_MODELS.KLING_2_5_TURBO,
      duration = 5,
      resolution = 'LANDSCAPE',
      isPublic = false,
      webhookUrl = null,
      template = null
    } = req.body;

    // Use template if specified
    let finalPrompt = prompt;
    let finalDuration = duration;

    if (template && VIDEO_TEMPLATES[template]) {
      finalPrompt = VIDEO_TEMPLATES[template].prompt;
      finalDuration = VIDEO_TEMPLATES[template].duration;
    }

    if (!finalPrompt) {
      return res.status(400).json({ error: 'Prompt is required (or use a template)' });
    }

    // Validate duration
    if (![5, 10].includes(finalDuration)) {
      return res.status(400).json({ error: 'Duration must be 5 or 10 seconds' });
    }

    // Get resolution settings
    const resConfig = KLING_RESOLUTIONS[resolution] || KLING_RESOLUTIONS.LANDSCAPE;

    const videoBody = {
      prompt: finalPrompt,
      model,
      duration: finalDuration,
      width: resConfig.width,
      height: resConfig.height,
      isPublic
    };

    console.log('Starting Kling text-to-video:', {
      prompt: finalPrompt.substring(0, 50) + '...',
      model,
      duration: finalDuration,
      resolution
    });

    const result = await leonardoRequest('/generations-text-to-video', 'POST', videoBody);

    if (result.sdGenerationJob?.generationId) {
      const generationId = result.sdGenerationJob.generationId;

      activeGenerations.set(generationId, {
        startedAt: new Date(),
        webhookUrl,
        type: 'video-text-to-video',
        model,
        duration: finalDuration
      });

      // Start polling if webhook is configured
      if (webhookUrl) {
        pollAndNotify(generationId, webhookUrl, 10000, 120); // Longer poll for video
      }

      res.json({
        success: true,
        generationId,
        type: 'text-to-video',
        model,
        duration: finalDuration,
        resolution: resConfig.ratio,
        message: webhookUrl
          ? 'Video generation started. Webhook will be called when complete.'
          : 'Video generation started. Use /video/generation/:id to check status.',
        estimatedTime: '2-5 minutes'
      });
    } else {
      res.status(500).json({ error: 'Failed to start video generation', details: result });
    }
  } catch (error) {
    console.error('Text-to-video error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image-to-Video generation with Kling
app.post('/video/image-to-video', async (req, res) => {
  try {
    const {
      prompt,
      imageId,
      imageType = 'GENERATED', // 'GENERATED' or 'UPLOADED'
      model = KLING_MODELS.KLING_2_5_TURBO,
      duration = 5,
      isPublic = false,
      webhookUrl = null,
      endFrameImageId = null,
      endFrameImageType = 'GENERATED'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required for image-to-video' });
    }

    // Validate duration
    if (![5, 10].includes(duration)) {
      return res.status(400).json({ error: 'Duration must be 5 or 10 seconds' });
    }

    const videoBody = {
      prompt,
      imageId,
      imageType,
      model,
      duration,
      isPublic
    };

    // Add end frame for Kling 2.1 Pro if provided
    if (model === KLING_MODELS.KLING_2_1_PRO && endFrameImageId) {
      videoBody.endFrameImage = {
        id: endFrameImageId,
        type: endFrameImageType
      };
    }

    console.log('Starting Kling image-to-video:', {
      prompt: prompt.substring(0, 50) + '...',
      imageId,
      model,
      duration
    });

    const result = await leonardoRequest('/generations-image-to-video', 'POST', videoBody);

    if (result.sdGenerationJob?.generationId) {
      const generationId = result.sdGenerationJob.generationId;

      activeGenerations.set(generationId, {
        startedAt: new Date(),
        webhookUrl,
        type: 'video-image-to-video',
        model,
        duration,
        sourceImageId: imageId
      });

      if (webhookUrl) {
        pollAndNotify(generationId, webhookUrl, 10000, 120);
      }

      res.json({
        success: true,
        generationId,
        type: 'image-to-video',
        model,
        duration,
        sourceImageId: imageId,
        message: webhookUrl
          ? 'Video generation started. Webhook will be called when complete.'
          : 'Video generation started. Use /video/generation/:id to check status.',
        estimatedTime: '2-5 minutes'
      });
    } else {
      res.status(500).json({ error: 'Failed to start video generation', details: result });
    }
  } catch (error) {
    console.error('Image-to-video error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get video generation status
app.get('/video/generation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Video generations use the same endpoint as image generations
    const result = await leonardoRequest(`/generations/${id}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate Christmas recruiter video (convenience endpoint)
app.post('/video/christmas-recruiter', async (req, res) => {
  try {
    const {
      style = 'greeting', // 'greeting' or 'intro'
      duration = 5,
      resolution = 'LANDSCAPE',
      webhookUrl = null,
      imageId = null, // Optional: use existing Christmas image
      customPromptAddition = ''
    } = req.body;

    const basePrompts = {
      greeting: 'Professional recruiter in festive Christmas outfit and Santa hat, waving hello with warm smile, modern office decorated with Christmas tree and lights, cozy holiday atmosphere, professional demeanor, natural movement',
      intro: 'Confident recruiter in elegant Christmas business attire, welcoming gesture, speaking to camera, festive office background with subtle holiday decorations, warm lighting, professional and friendly',
      celebration: 'Happy recruitment team celebrating successful placement, Christmas party atmosphere, confetti and champagne, festive office decorations, joyful expressions, warm holiday lighting'
    };

    const prompt = customPromptAddition
      ? `${basePrompts[style] || basePrompts.greeting}, ${customPromptAddition}`
      : basePrompts[style] || basePrompts.greeting;

    const resConfig = KLING_RESOLUTIONS[resolution] || KLING_RESOLUTIONS.LANDSCAPE;

    let videoBody;
    let endpoint;

    if (imageId) {
      // Image-to-video if image provided
      endpoint = '/generations-image-to-video';
      videoBody = {
        prompt,
        imageId,
        imageType: 'GENERATED',
        model: KLING_MODELS.KLING_2_5_TURBO,
        duration,
        isPublic: false
      };
    } else {
      // Text-to-video
      endpoint = '/generations-text-to-video';
      videoBody = {
        prompt,
        model: KLING_MODELS.KLING_2_5_TURBO,
        duration,
        width: resConfig.width,
        height: resConfig.height,
        isPublic: false
      };
    }

    console.log(`Generating Christmas recruiter video (${style})...`);

    const result = await leonardoRequest(endpoint, 'POST', videoBody);

    if (result.sdGenerationJob?.generationId) {
      const generationId = result.sdGenerationJob.generationId;

      activeGenerations.set(generationId, {
        startedAt: new Date(),
        webhookUrl,
        type: 'christmas-recruiter-video',
        style,
        duration
      });

      if (webhookUrl) {
        pollAndNotify(generationId, webhookUrl, 10000, 120);
      }

      res.json({
        success: true,
        generationId,
        type: imageId ? 'image-to-video' : 'text-to-video',
        style,
        duration,
        resolution: resConfig.ratio,
        message: webhookUrl
          ? 'Christmas video generation started. Webhook will be called when complete.'
          : 'Video generation started. Use /video/generation/:id to check status.',
        estimatedTime: '2-5 minutes'
      });
    } else {
      res.status(500).json({ error: 'Failed to start video generation', details: result });
    }
  } catch (error) {
    console.error('Christmas video error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload init image for video generation
app.post('/video/upload-image', async (req, res) => {
  try {
    const { imageUrl, extension = 'jpg' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const result = await leonardoRequest('/init-image', 'POST', {
      imageUrl,
      extension
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3025;
app.listen(PORT, () => {
  console.log('============================================');
  console.log('LEONARDO AI MCP SERVER - SDK EDITION v2.1');
  console.log('With Kling Video Generation & Webhooks');
  console.log('============================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
  console.log('');
  console.log('IMAGE ENDPOINTS:');
  console.log('  GET  /health                       - Health check');
  console.log('  GET  /user                         - User info & credits');
  console.log('  GET  /models                       - List image models');
  console.log('  GET  /templates/christmas          - Christmas templates');
  console.log('  POST /generate                     - Create image');
  console.log('  POST /generate/christmas-recruiter - Christmas image');
  console.log('  POST /generate-sync                - Generate & wait');
  console.log('  GET  /generation/:id               - Get status');
  console.log('');
  console.log('VIDEO ENDPOINTS (Kling 2.5/2.6):');
  console.log('  GET  /video/models                 - List video models');
  console.log('  POST /video/text-to-video          - Text to video');
  console.log('  POST /video/image-to-video         - Image to video');
  console.log('  POST /video/christmas-recruiter    - Christmas video');
  console.log('  POST /video/upload-image           - Upload init image');
  console.log('  GET  /video/generation/:id         - Get video status');
  console.log('');
  console.log('WEBHOOK ENDPOINTS:');
  console.log('  POST /webhooks/subscribe           - Register webhook');
  console.log('  GET  /webhooks                     - List webhooks');
  console.log('  POST /webhooks/test                - Test webhook');
  console.log('  DELETE /webhooks/:id               - Remove webhook');
  console.log('');
  console.log('OTHER:');
  console.log('  GET  /generations/active           - Active generations');
  console.log('  POST /prompt/improve               - Improve prompt');
  console.log('  POST /prompt/random                - Random prompt');
  console.log('============================================');

  if (!API_KEY) {
    console.log('\nWARNING: LEONARDO_API_KEY not set!');
    console.log('Set it in your .env file to enable API calls.');
  }
});

module.exports = app;
