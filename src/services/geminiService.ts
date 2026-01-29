import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ImageGenerationResult {
    success: boolean;
    images?: string[];
    error?: string;
}

export async function generateThumbnails(
    apiKey: string,
    prompt: string,
    count: number = 3
): Promise<ImageGenerationResult> {
    try {
        if (!apiKey) {
            return { success: false, error: 'API key is required' };
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use Gemini 2.0 Flash for image generation
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp-image-generation',
            generationConfig: {
                responseModalities: ['Text', 'Image'],
            } as Record<string, unknown>,
        });

        const enhancedPrompt = `Create a professional, eye-catching YouTube thumbnail with the following requirements:
- High-quality, vibrant, and engaging design
- Bold, readable text if text is needed
- Striking colors that pop and grab attention
- Clean composition optimized for 16:9 aspect ratio
- Professional lighting and contrast
- The thumbnail should make viewers want to click

User's request: ${prompt}

Generate a single high-quality YouTube thumbnail image.`;

        const images: string[] = [];

        // Generate multiple images sequentially
        for (let i = 0; i < count; i++) {
            try {
                const result = await model.generateContent([
                    { text: enhancedPrompt + ` (Variation ${i + 1} of ${count} - make this unique)` }
                ]);
                const response = result.response;

                // Extract images from response
                if (response.candidates && response.candidates[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
                            const base64Data = part.inlineData.data;
                            const mimeType = part.inlineData.mimeType;
                            const dataUrl = `data:${mimeType};base64,${base64Data}`;
                            images.push(dataUrl);
                        }
                    }
                }
            } catch (genError) {
                console.error(`Error generating image ${i + 1}:`, genError);
                // Continue trying to generate other images
            }
        }

        if (images.length === 0) {
            return {
                success: false,
                error: 'Failed to generate any images. Please try a different prompt or check your API key.',
            };
        }

        return { success: true, images };
    } catch (error) {
        console.error('Error generating thumbnails:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        if (errorMessage.includes('API_KEY_INVALID')) {
            return { success: false, error: 'Invalid API key. Please check your Google AI Studio API key.' };
        }
        if (errorMessage.includes('QUOTA_EXCEEDED')) {
            return { success: false, error: 'API quota exceeded. Please try again later or upgrade your plan.' };
        }
        if (errorMessage.includes('SAFETY')) {
            return { success: false, error: 'The prompt was blocked due to safety filters. Please try a different prompt.' };
        }

        return { success: false, error: errorMessage };
    }
}

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string; isRateLimited?: boolean }> {
    try {
        if (!apiKey || apiKey.trim().length === 0) {
            return { valid: false, error: 'API key cannot be empty' };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-1.5-flash for lighter validation
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Simple test to validate the API key
        await model.generateContent('ping');

        return { valid: true };
    } catch (error) {
        console.error('API key validation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('429') || errorMessage.includes('QUOTA_EXCEEDED')) {
            return {
                valid: true, // Key exists but is rate-limited
                isRateLimited: true,
                error: 'Key is valid, but current quota is exceeded. You can still save it and try later.'
            };
        }

        if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('403')) {
            return { valid: false, error: 'Invalid API key. Please check your key.' };
        }

        return { valid: false, error: 'Could not validate: ' + errorMessage };
    }
}
