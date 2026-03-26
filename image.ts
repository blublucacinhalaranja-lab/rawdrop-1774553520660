'use server';

/**
 * Módulo de geração de imagens utilizando AI Horde.
 * Realiza a chamada assíncrona e monitora o status até a finalização.
 */

const API_KEY = "bu2TBsVMRANTG3nkhYkEtQ";

export async function generateImage(prompt: string) {
  try {
    if (!prompt) {
      throw new Error("O prompt enviado está vazio.");
    }

    // 1. Enviar pedido assíncrono para a AI Horde
    const response = await fetch("https://aihorde.net/api/v2/generate/async", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
        "Client-Agent": "CleanCanvasIA:1.0:AI"
      },
      body: JSON.stringify({
        prompt: prompt,
        models: ["Deliberate"],
        params: {
          width: 512,
          height: 512,
          steps: 25,
          n: 1,
          sampler_name: "k_euler",
          cfg_scale: 7.5
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI Horde Error (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const id = data.id;

    if (!id) {
      throw new Error("Não foi possível obter o ID de geração da AI Horde.");
    }

    // 2. Polling: Esperar a imagem ser finalizada
    let imageUrl = null;
    let isDone = false;
    let attempts = 0;
    const maxAttempts = 30; // ~90 segundos máximo

    while (!isDone && attempts < maxAttempts) {
      // Esperar 3 segundos entre verificações
      await new Promise(r => setTimeout(r, 3000));
      attempts++;

      const checkResponse = await fetch(`https://aihorde.net/api/v2/generate/status/${id}`);
      
      if (!checkResponse.ok) continue;

      const result = await checkResponse.json();

      if (result.faulted) {
        throw new Error("A geração de imagem falhou no servidor da AI Horde.");
      }

      if (result.done && result.generations && result.generations.length > 0) {
        isDone = true;
        imageUrl = result.generations[0].img; // Retorna a URL ou Base64 da imagem
      }
    }

    if (!imageUrl) {
      throw new Error("Tempo de espera esgotado. A IA está demorando mais que o esperado.");
    }

    return imageUrl;

  } catch (error: any) {
    console.error("Erro Crítico na Geração (Horde):", error);
    // Retorna a mensagem de erro real para ser exibida no chat
    throw new Error(error.message || "Erro desconhecido na API de imagem.");
  }
}
