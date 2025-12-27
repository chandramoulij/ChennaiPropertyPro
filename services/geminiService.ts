import { GoogleGenAI, Type } from "@google/genai";
import { AuctionProperty } from '../types';

// The API key is injected by Vite from VITE_API_KEY into process.env.API_KEY during build
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseAuctionText = async (rawText: string): Promise<Partial<AuctionProperty>> => {
  if (!rawText || rawText.length < 10) {
    throw new Error("Text is too short to parse.");
  }

  const model = "gemini-3-flash-preview";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Extract bank auction details from the following text. 
      If a field is missing, leave it as null or empty string. 
      Format dates as YYYY-MM-DD.
      Estimate a short SEO-friendly title if none exists.
      For category, choose strictly from: Residential, Commercial, Land, Industrial.
      
      Text to analyze:
      ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy title for the listing" },
            bankName: { type: Type.STRING, description: "Name of the bank selling the property" },
            reservePrice: { type: Type.NUMBER, description: "Reserve price in numbers" },
            emdAmount: { type: Type.NUMBER, description: "EMD amount in numbers" },
            auctionDate: { type: Type.STRING, description: "Date of auction in YYYY-MM-DD" },
            location: { type: Type.STRING, description: "Street Address or specific location" },
            area: { type: Type.STRING, description: "Locality or Area name" },
            city: { type: Type.STRING, description: "City name" },
            category: { type: Type.STRING, description: "One of: Residential, Commercial, Land, Industrial" },
            description: { type: Type.STRING, description: "A detailed, professional description" },
            contactNumber: { type: Type.STRING, description: "Contact number if found" },
            possessionStatus: { type: Type.STRING, description: "Physical or Symbolic" },
          },
          required: ["title", "bankName", "reservePrice", "city", "category"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);
    throw new Error(error.message || "AI was unable to process this text.");
  }
};

export const generateDescription = async (details: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Write a high-converting real estate description for a bank auction: ${details}. Max 150 words.`
      });
      return response.text || "";
    } catch (e) {
      return "Property description currently unavailable.";
    }
}