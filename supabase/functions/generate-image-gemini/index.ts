import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  image: string;
  prompt: string;
  filename?: string;
  mimeType?: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, prompt, filename, mimeType } = await req.json() as RequestBody;

    // Validate input
    if (!image || !prompt) {
      throw new Error('Missing required fields: image and prompt');
    }

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Generating image with Gemini 2.5 Flash...');
    console.log('Prompt:', prompt);
    console.log('Input image size:', image.length, 'characters');

    // Prepare the request to Gemini API
    // Using Gemini 2.5 Flash with imagen capability
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

    const geminiPayload = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: mimeType || 'image/jpeg',
              data: image
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain"
      }
    };

    console.log('Calling Gemini API...');

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json() as GeminiResponse;
    console.log('Gemini response received');

    // Extract the generated content
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API');
    }

    const candidate = geminiData.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('No content parts in Gemini response');
    }

    // Look for inline image data in the response
    let generatedImage = null;
    let generatedText = null;

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        generatedImage = {
          mimeType: part.inlineData.mimeType,
          data: part.inlineData.data
        };
      }
      if (part.text) {
        generatedText = part.text;
      }
    }

    // Return the result
    const result: any = {
      success: true,
      timestamp: new Date().toISOString(),
    };

    if (generatedImage) {
      // Return as base64 data URI
      result.image_url = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
      result.mimeType = generatedImage.mimeType;
      console.log('Image generated successfully');
    } else if (generatedText) {
      // If Gemini returns text instead of image, include it in response
      result.text = generatedText;
      result.message = 'Gemini returned text response instead of image. The model may have interpreted the request differently.';
      console.log('Text response:', generatedText);
    } else {
      throw new Error('No image or text content in Gemini response');
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-image-gemini:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
