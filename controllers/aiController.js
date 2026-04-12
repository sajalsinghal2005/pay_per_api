const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

/**
 * Generate text using OpenAI GPT
 */
async function generateText(req, res) {
    try {
        const { prompt, model = 'gpt-3.5-turbo', max_tokens = 500 } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required'
            });
        }

        if (!OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'AI service not configured'
            });
        }

        const response = await axios.post(
            `${OPENAI_BASE_URL}/chat/completions`,
            {
                model,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;

        res.json({
            success: true,
            data: {
                prompt,
                response: content,
                model,
                tokens_used: response.data.usage.total_tokens
            }
        });
    } catch (err) {
        console.error('[AI Error]:', err.response?.data || err.message);
        res.status(500).json({
            success: false,
            message: 'AI request failed',
            error: err.response?.data?.error?.message || err.message
        });
    }
}

/**
 * Generate image using OpenAI DALL-E
 */
async function generateImage(req, res) {
    try {
        const { prompt, size = '512x512' } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required'
            });
        }

        if (!OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'AI service not configured'
            });
        }

        const response = await axios.post(
            `${OPENAI_BASE_URL}/images/generations`,
            {
                prompt,
                n: 1,
                size
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            data: {
                prompt,
                image_url: response.data.data[0].url,
                size
            }
        });
    } catch (err) {
        console.error('[AI Image Error]:', err.response?.data || err.message);
        res.status(500).json({
            success: false,
            message: 'Image generation failed',
            error: err.response?.data?.error?.message || err.message
        });
    }
}

module.exports = {
    generateText,
    generateImage
};
