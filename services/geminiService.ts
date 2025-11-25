import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert base64 URL to raw base64 string (removing data:image/png;base64, prefix)
const stripBase64Prefix = (base64Url: string): string => {
  return base64Url.split(',')[1] || base64Url;
};

// Helper to get mimeType
const getMimeType = (base64Url: string): string => {
  const match = base64Url.match(/^data:(.+);base64,/);
  return match ? match[1] : 'image/jpeg'; // Default fall back
};

export const editImageWithGemini = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  try {
    const client = getClient();
    const cleanBase64 = stripBase64Prefix(imageBase64);
    const mimeType = getMimeType(imageBase64);

    // Using gemini-2.5-flash-image as requested for Nano Banana / Image editing
    // We send the image + text prompt.
    // The model will generate a NEW image based on the input image + instructions.
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            // Spanish wrapper for the prompt
            text: `Edita esta imagen: ${prompt}. Devuelve solo la imagen editada.`
          }
        ]
      }
    });

    // Extract the image from the response
    // The response candidates parts will contain inlineData if successful
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           // Re-attach prefix for frontend display
           // Note: The model usually returns image/jpeg or image/png. 
           // The SDK response `mimeType` in `inlineData` is authoritative.
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No se generó ninguna imagen.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};