
/**
 * Módulo de IA do Clean Canvas.
 * Centraliza as chamadas de processamento utilizando o OpenRouter via Genkit.
 */
import { ai } from "@/ai/openrouter";

export const IA = {
  initialize: () => {
    console.log("IA Module initialized with OpenRouter.");
  },
  
  process: async (input: string) => {
    try {
      const response = await ai.generate(input);
      return response.text;
    } catch (error) {
      console.error("Erro ao processar IA via OpenRouter:", error);
      return null;
    }
  }
};
