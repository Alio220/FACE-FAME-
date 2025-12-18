import { GoogleGenAI, Type, FunctionDeclaration, Modality, Schema } from "@google/genai";
import { AppMode } from "../types";

// Helper to get a fresh client instance (important for Veo key selection)
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Veo Video Generation ---

export const generateVideo = async (
  prompt: string,
  imageBase64?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
) => {
  const ai = getAiClient();
  
  // Prepare input. If image is provided, use it as the starting frame.
  const model = 'veo-3.1-fast-generate-preview';
  
  let operation;
  
  try {
    if (imageBase64) {
      operation = await ai.models.generateVideos({
        model,
        prompt,
        image: {
          imageBytes: imageBase64,
          mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas/input
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        }
      });
    } else {
      operation = await ai.models.generateVideos({
        model,
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        }
      });
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (operation.error) {
        throw new Error(operation.error.message || "Video generation failed");
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned");

    // Fetch the actual video blob
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error("Failed to download video bytes");
    return await response.blob();
  } catch (error) {
    console.error("Veo Error:", error);
    throw error;
  }
};

// --- Image Generation (Gemini 3 Pro) ---

export const generateImage = async (
  prompt: string,
  aspectRatio: string = "1:1",
  imageSize: string = "1K"
) => {
  const ai = getAiClient();
  const model = 'gemini-3-pro-image-preview';

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any,
      },
    },
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// --- Image Editing (Gemini 2.5 Flash) ---

export const editImage = async (
  base64Image: string,
  prompt: string,
  mimeType: string = 'image/jpeg'
) => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash-image';

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

   // Extract image
   for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image returned");
};


// --- Video Analysis (Gemini 3 Pro) ---

export const analyzeVideo = async (
  videoFile: File,
  prompt: string
) => {
    // Note: For large videos in a real app, we'd use the File API to upload.
    // For this demo, assuming small clips (< 20MB) that fit in inlineData or base64.
    // However, Gemini API limits inline data size.
    // We will attempt to read as base64.
    
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            try {
                const ai = getAiClient();
                // Using gemini-3-pro-preview for complex reasoning/video understanding
                const model = 'gemini-3-pro-preview'; 
                
                const response = await ai.models.generateContent({
                    model,
                    contents: {
                        parts: [
                            {
                                inlineData: {
                                    mimeType: videoFile.type,
                                    data: base64Data
                                }
                            },
                            { text: prompt }
                        ]
                    }
                });
                resolve(response.text || "No analysis generated.");
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(videoFile);
    });
};

// --- Live API helper is handled inside the component due to statefulness ---
export const getLiveClient = () => getAiClient();
