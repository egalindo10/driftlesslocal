import { GoogleGenAI } from "@google/genai";
import { Location, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function fetchLocations(area: string): Promise<Location[]> {
  const model = "gemini-2.5-flash";
  const prompt = `Find the best art galleries, coffee shops, dog parks, hiking trails, local boutiques, craft shops, and tourist attractions in the ${area} area (specifically Spring Green and Mineral Point, Wisconsin). 
  
  MANDATORY: You MUST include these specific places if they exist in your data:
  - Taliesin (Frank Lloyd Wright)
  - Arcadia Books
  - House on the Rock
  - Shakerag Alley Center for the Arts
  - American Players Theatre
  - Pendarvis State Historic Site
  - Governor Dodge State Park
  - Cave of the Mounds
  - Mineral Point Opera House
  - Brewery Creek Brewpub
  
  Return a JSON array of at least 35 objects with the following structure:
  {
    "id": "unique-id",
    "name": "Name of the place",
    "category": "art" | "coffee" | "dog-park" | "trail-park" | "attraction" | "shop",
    "description": "A short, fun, trendy description",
    "address": "Full address",
    "lat": latitude,
    "lng": longitude,
    "rating": rating,
    "website": "URL if available"
  }
  Note: 
  - Separate "dog-park" (specifically for dogs) from "trail-park" (hiking trails, nature preserves, state parks).
  - Use "shop" for local boutiques, craft stores, and unique retail spots.
  Focus on high-quality, popular spots that tourists would love.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text;
    if (!text) return [];
    
    // Find the first [ and last ] to extract the JSON array
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1) {
      console.warn("No JSON array found in response:", text);
      return [];
    }

    const jsonStr = text.substring(start, end + 1);
    return JSON.parse(jsonStr) as Location[];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function getLocalTips(locationName: string): Promise<{ text: string; links?: { uri: string; title: string }[] }> {
  const model = "gemini-2.5-flash";
  const prompt = `Search for ${locationName} in Wisconsin and provide 3 "local tips" or "insider secrets" based on actual Google Reviews and visitor feedback. Focus on what people specifically love or recommend (e.g., a specific dish, the best time to visit, or a hidden detail). Keep it trendy, fun, and concise. Use emojis.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const text = response.text || "No tips available yet!";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const links = chunks?.map(chunk => {
      if (chunk.maps) {
        return { uri: chunk.maps.uri, title: chunk.maps.title || "View on Maps" };
      }
      return null;
    }).filter(Boolean) as { uri: string; title: string }[] | undefined;

    return { text, links };
  } catch (error) {
    console.error("Error fetching tips:", error);
    return { text: "Could not load tips." };
  }
}
