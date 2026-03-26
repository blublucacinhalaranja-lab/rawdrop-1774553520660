
'use server';

/**
 * Roteador de mensagens inteligente.
 * Agora suporta anexos multi-modais (Imagens e Arquivos).
 */

import { perguntarIA, type AIAttachment } from "./openrouter";
import { generateImage } from "./image";

export type ProjectFile = {
  path: string;
  language: string;
  content: string;
};

export type ProjectData = {
  projectName: string;
  files: ProjectFile[];
};

export type MessageResponse = {
  type: "text" | "image" | "project";
  content: string;
  projectData?: ProjectData;
};

export async function handleMessage(
  message: string, 
  isImageMode: boolean, 
  attachments?: AIAttachment[]
): Promise<MessageResponse> {
  try {
    if (!message && (!attachments || attachments.length === 0)) {
      return { type: "text", content: "Por favor, digite uma mensagem ou envie um arquivo." };
    }

    // MODO IMAGEM ATIVO (GERAÇÃO)
    if (isImageMode) {
      try {
        const promptRefinementSystem = `Você é um engenheiro de prompts de elite. Transforme o pedido em um prompt técnico ULTRA DETALHADO em INGLÊS. SAÍDA: Apenas o prompt.`;
        const enhancedPrompt = await perguntarIA(message, promptRefinementSystem);
        const imageUrl = await generateImage(enhancedPrompt);
        return { type: "image", content: imageUrl };
      } catch (e: any) {
        return { type: "text", content: `❌ **Falha na Geração:**\n\n${e.message}` };
      }
    }

    // MODO CHAT / ANÁLISE / PROJETO
    const textResponse = await perguntarIA(message, undefined, attachments);

    // Detectar Geração de Projeto
    if (textResponse.includes("project_generation:")) {
      try {
        const projectNameMatch = textResponse.match(/project_name: ([^\n]+)/);
        const projectName = projectNameMatch ? projectNameMatch[1].trim() : "Novo Projeto";
        
        const files: ProjectFile[] = [];
        const fileBlocks = textResponse.split("- path:").slice(1);

        fileBlocks.forEach(block => {
          const lines = block.split("\n");
          const path = lines[0].trim();
          const languageMatch = block.match(/language: ([^\n]+)/);
          const language = languageMatch ? languageMatch[1].trim() : "text";
          
          const contentStartIdx = block.indexOf("content: |");
          if (contentStartIdx !== -1) {
            let content = block.substring(contentStartIdx + 10).trim();
            const nextFileIdx = content.indexOf("- path:");
            if (nextFileIdx !== -1) {
              content = content.substring(0, nextFileIdx).trim();
            }
            files.push({ path, language, content });
          }
        });

        if (files.length > 0) {
          return {
            type: "project",
            content: "Iniciando Engine de Geração de Projeto...",
            projectData: { projectName, files }
          };
        }
      } catch (err) {
        console.error("Erro ao fazer parse do projeto:", err);
      }
    }

    return {
      type: "text",
      content: textResponse || "Não recebi uma resposta da IA. Tente novamente."
    };
  } catch (error: any) {
    console.error("Router Critical Error:", error);
    return {
      type: "text",
      content: `⚠️ **Erro de Sistema:**\n\n${error.message}`
    };
  }
}
