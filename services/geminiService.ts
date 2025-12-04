
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const diagnosePlant = async (imageBase64: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            text: "Analyze this plant image. Identify the plant, diagnose any visible diseases or pest issues, and recommend treatments. Format with Markdown."
          }
        ]
      }
    });
    return response.text || "No diagnosis could be generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to analyze image. Please try again.";
  }
};

export const getPlantingAdvice = async (crop: string, location: string, soilType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Act as an expert agronomist. Provide a detailed planting schedule and advice for ${crop} in ${location} with ${soilType} soil. Include best time to plant, spacing, water requirements, and common risks.`
    });
    return response.text || "No advice generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to get advice.";
  }
};

export const predictYield = async (farmDataJson: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following farm data (plots, seasons, recent activities), predict the potential yield and identify risks:\n\n${farmDataJson}`
    });
    return response.text || "No prediction generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to predict yield.";
  }
};

export const summarizeRecords = async (recordsJson: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following recent farm tasks and financial entries into a concise executive brief:\n\n${recordsJson}`
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to summarize records.";
  }
};
