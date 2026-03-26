'use server';

/**
 * @fileOverview Engine de Exportação do Sistema XZAFE.
 * Varre o diretório do projeto e gera um ZIP completo do código-fonte.
 */

import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function addDirectoryToZip(zip: JSZip, dirPath: string, rootDir: string) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    const relativePath = path.relative(rootDir, filePath);
    
    // Filtros de exclusão para manter o ZIP leve e funcional
    const blackList = [
      'node_modules', 
      '.next', 
      '.git', 
      '.turbo', 
      'out', 
      'build', 
      '.firebase', 
      '.idx'
    ];
    
    if (blackList.includes(file)) continue;

    if (stats.isDirectory()) {
      await addDirectoryToZip(zip, filePath, rootDir);
    } else {
      // Apenas arquivos de texto/configuração relevantes
      const content = fs.readFileSync(filePath);
      zip.file(relativePath, content);
    }
  }
}

export async function exportProjectSource(): Promise<string> {
  const zip = new JSZip();
  const projectRoot = process.cwd();
  
  // Adiciona os diretórios principais e arquivos de raiz
  await addDirectoryToZip(zip, projectRoot, projectRoot);
  
  const base64 = await zip.generateAsync({ 
    type: 'base64',
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
  
  return base64;
}
