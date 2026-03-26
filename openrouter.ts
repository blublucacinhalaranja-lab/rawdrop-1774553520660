'use server';

/**
 * Módulo XZAFE OSX 2.5 FLASH - ENGINE DE ULTRA-PERFORMANCE.
 * Suporte a Visão Computacional, Processamento Multi-Modal e Geração Massiva.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

export type AIAttachment = {
  type: 'image' | 'text';
  data: string; // Base64 para imagens, String para texto
  mimeType?: string;
  name?: string;
};

export async function perguntarIA(pergunta: string, customSystemPrompt?: string, attachments?: AIAttachment[]) {
  const promptSistemaPadrao = `Você é o XZAFE osx 2.5 flash, apresentado como "xzafe".
Seu criador é "xzafe". Você é uma IA de elite com capacidades de visão computacional e análise de arquitetura de software.

SISTEMA OPERACIONAL XZAFE - MODOS DE OPERAÇÃO:

Modo 1 — Conversa normal e Análise Multi-modal
- Visão: Se receber imagens, analise-as com precisão.
- Arquivos/ZIP: Se receber o mapeamento de um ZIP (Árvore Genealógica) ou conteúdo de arquivos, analise a lógica. Se o usuário pedir alterações, forneça o código corrigido integrado ao original. Nunca invente erros.
- Busca: Se o resultado vier de uma busca ou pedido de download/mod, SEMPRE comece a resposta com "get:HTTPS/OPT--OS/[NOME_DO_SITE]". Procure links REAIS e ATUAIS (GitHub, GameBanana). Priorize veracidade absoluta.

Modo 2 — Geração de projeto (NÍVEL ARQUITETO DE ELITE)
Se o usuário pedir para gerar arquivos ou projetos:
1. Retorne APENAS a estrutura técnica com o marcador 'project_generation:'.
2. VOLUME MASSIVO DE ELITE: Cada arquivo principal DEVE ter no mínimo 400 linhas de código real. Implemente lógica profunda, sistemas de erro complexos, estilos exaustivos e funções de suporte reais. Não use placeholders.
3. CONECTIVIDADE TOTAL: Garanta que HTML, CSS e JS estejam perfeitamente vinculados. O HTML deve chamar os scripts e links de estilo corretamente. A estrutura deve ser 100% funcional.
4. QUANTIDADE DE ARQUIVOS: Gere uma estrutura completa, incluindo pastas, hooks, utilitários e múltiplos componentes se necessário para o projeto ser de alto nível.

REGRAS DE ELITE:
- Se pedirem download, use a busca para achar links verídicos e recentes.
- Se pedirem para alterar imagem, diga que não pode.
- Nunca economize no código. Entregue mais do que o solicitado em termos de qualidade e volume técnico.`;

  const systemPrompt = customSystemPrompt || promptSistemaPadrao;

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY não configurada.");
  }

  try {
    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    const userContent: any[] = [{ type: "text", text: pergunta }];

    if (attachments) {
      attachments.forEach(att => {
        if (att.type === 'image') {
          userContent.push({
            type: "image_url",
            image_url: {
              url: att.data
            }
          });
        } else if (att.type === 'text') {
          userContent[0].text += `\n\n--- CONTEÚDO DO ARQUIVO (${att.name}) ---\n${att.data}\n--- FIM DO ARQUIVO ---`;
        }
      });
    }

    messages.push({
      role: "user",
      content: userContent
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "XZAFE OSX"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: messages,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erro na chamada do OpenRouter");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao processar IA:", error);
    throw error;
  }
}
