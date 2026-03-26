"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, Loader2, ArrowLeft, Copy, Check, ImageIcon, Sparkles, X, 
  Globe, Search, ExternalLink, Zap, Terminal, Menu, MessageSquare, 
  UserCircle, LayoutGrid, FileCode, Folder, Download, CheckCircle2,
  Code2, Hash, Cpu, Paperclip, FileArchive, FileText, Trash2, Info, Share2,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription
} from "@/components/ui/sheet";
import { handleMessage, type MessageResponse, type ProjectData, type ProjectFile } from "@/ai/router";
import { type AIAttachment } from "@/ai/openrouter";
import { exportProjectSource } from "@/app/actions/export-project";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import JSZip from "jszip";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image" | "project";
  projectData?: ProjectData;
  isGenerating?: boolean;
}

interface SearchResult {
  site: string;
  title: string;
  snippet: string;
  url: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'zip' | 'text';
  data: string; // base64 ou texto puro
  preview?: string;
}

function ProjectGenerator({ project }: { project: ProjectData }) {
  const [currentFileIdx, setCurrentFileIdx] = useState(0);
  const [typedContent, setTypedContent] = useState("");
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentFileIdx >= project.files.length) {
      setIsDone(true);
      return;
    }

    const file = project.files[currentFileIdx];
    let i = 0;
    const typingSpeed = 1; 
    const charIncrement = 250; 
    const previewLength = Math.min(file.content.length, 3500);
    
    const timer = setInterval(() => {
      if (i < previewLength) {
        setTypedContent(file.content.substring(0, i + charIncrement)); 
        i += charIncrement;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setCompletedFiles(prev => [...prev, file.path]);
          setCurrentFileIdx(prev => prev + 1);
          setTypedContent("");
          setProgress(((currentFileIdx + 1) / project.files.length) * 100);
        }, 5); 
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [currentFileIdx, project.files]);

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    project.files.forEach(file => {
      zip.file(file.path, file.content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.projectName.replace(/\s+/g, '_')}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTotalLines = (content: string) => content.split('\n').length;

  return (
    <div className={cn(
      "my-10 w-full bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in zoom-in",
      isDone ? "max-w-md mx-auto" : "max-w-4xl"
    )}>
      <div className="bg-white/[0.03] border-b border-white/5 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
            <Cpu className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-widest text-white">{project.projectName}</h3>
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
              {isDone ? "Arquitetura Concluída ✓" : "Injeção de Ultra-Performance (400+ LOC)"}
            </p>
          </div>
        </div>
        {isDone && (
          <Button 
            onClick={handleDownloadZip}
            size="sm"
            className="bg-accent text-black hover:bg-accent/80 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg"
          >
            <Download className="w-3 h-3" />
            BAIXAR PROJETO
          </Button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {!isDone && (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">Deployment Turbo Ativo...</span>
              <span className="text-[9px] font-mono text-zinc-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-white/5" />
          </div>
        )}

        <div className={cn("grid gap-4", isDone ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-5")}>
          <div className={cn(
            "space-y-2 overflow-y-auto pr-2 no-scrollbar transition-all duration-700",
            isDone ? "max-h-[300px]" : "lg:col-span-2 max-h-[400px]"
          )}>
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-3">Estrutura de Arquivos</p>
            {project.files.map((file, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border transition-all duration-500",
                  completedFiles.includes(file.path) 
                    ? "bg-accent/[0.04] border-accent/20 text-white" 
                    : (currentFileIdx === idx ? "bg-white/[0.08] border-white/30 text-white animate-pulse" : "bg-transparent border-white/[0.02] text-zinc-800")
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {completedFiles.includes(file.path) ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 shrink-0 opacity-40" />
                  )}
                  <span className="text-[11px] font-bold truncate tracking-tight">{file.path}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {getTotalLines(file.content)} LOC
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!isDone && (
            <div className="lg:col-span-3 bg-black/80 rounded-3xl border border-white/5 p-5 flex flex-col h-[400px] animate-in slide-in-from-right-8">
               <div className="flex items-center justify-between mb-4">
                 <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                   <Terminal className="w-3 h-3 text-accent" /> Injeção de Código Fonte
                 </p>
                 <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full bg-accent/10 text-accent">Elite Engine</span>
               </div>
               <div className="flex-1 font-mono text-[11px] text-accent/80 overflow-hidden leading-relaxed whitespace-pre-wrap break-all opacity-90 border-t border-white/5 pt-4">
                  {typedContent || "// Inicializando injeção de lógica massiva..."}
                  <span className="inline-block w-1.5 h-3.5 bg-accent animate-pulse ml-1" />
               </div>
            </div>
          )}
        </div>
      </div>
      
      {isDone && (
        <div className="p-5 bg-accent/5 border-t border-white/5 text-center">
          <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">
            SISTEMA COMPLETO ✓ {project.files.length} ARQUIVOS / {project.files.reduce((acc, f) => acc + getTotalLines(f.content), 0)} LINHAS TOTAIS
          </p>
        </div>
      )}
    </div>
  );
}

function ImageBlock({ url, isGenerating }: { url?: string; isGenerating?: boolean }) {
  return (
    <div className="my-6 space-y-3 w-full max-w-[280px] sm:max-w-[400px]">
      <div 
        className={cn(
          "relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl",
          isGenerating ? "bg-white/5 animate-pulse" : "bg-zinc-900"
        )}
      >
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            <ImageIcon className="w-5 h-5 text-white/20" />
          </div>
        ) : (
          <img 
            src={url} 
            alt="Generated content" 
            className="w-full h-full object-cover animate-in fade-in duration-1000"
          />
        )}
      </div>
      <div className="flex items-center gap-2 px-1">
        {isGenerating ? (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent animate-pulse">Criando Arte...</span>
        ) : (
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-600">Finalizada</span>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] relative w-full shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#141414] border-b border-white/5">
        <span className="text-[10px] uppercase text-zinc-500 font-mono tracking-widest font-bold">
          {language || "source"}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-tighter"
        >
          {copied ? (
            <><Check className="w-3 h-3" /> Copiado</>
          ) : (
            <><Copy className="w-3 h-3" /> Copiar</>
          )}
        </button>
      </div>
      <div className="p-4 bg-black/40 overflow-x-auto">
        <pre className="text-[13px] font-mono text-white leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function FormattedMessage({ content }: { content: string }) {
  let cleanContent = content;
  const sourceMatch = cleanContent.match(/get:HTTPS\/OPT--OS\/[:\s]*([^\n\s]+)/i);
  const sourceSite = sourceMatch ? sourceMatch[1].trim() : null;
  
  cleanContent = cleanContent.replace(/get:HTTPS\/OPT--OS\/[^\n]*/i, "").trim();

  const parts = cleanContent.split(/(```[\s\S]*?```)/g);

  const getFavicon = (site: string) => {
    let domain = site.toLowerCase().replace(/\s+/g, '').replace(/:/g, '');
    if (!domain.includes('.')) {
      const mapping: Record<string, string> = {
        'instagram': 'instagram.com', 'twitter': 'twitter.com', 'google': 'google.com',
        'github': 'github.com', 'facebook': 'facebook.com', 'reddit': 'reddit.com',
        'youtube': 'youtube.com', 'linkedin': 'linkedin.com', 'x': 'twitter.com',
        'wikipedia': 'wikipedia.org', 'crunchyroll': 'crunchyroll.com', 
        'gamebanana': 'gamebanana.com', 'gamejolt': 'gamejolt.com', 'itchio': 'itch.io'
      };
      domain = mapping[domain] || `${domain}.com`;
    }
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {sourceSite && (
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 w-fit mb-8 animate-in fade-in slide-in-from-top-4 duration-700 shadow-sm">
          <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <img src={getFavicon(sourceSite)} alt={sourceSite} className="w-3.5 h-3.5 object-contain" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">{sourceSite}</span>
        </div>
      )}

      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
          const lang = match?.[1] || "";
          const code = match?.[2] || part.replace(/```/g, "").trim();
          return <CodeBlock key={index} code={code} language={lang} />;
        }

        return (
          <div key={index} className="space-y-4 w-full max-full">
            {part.split("\n").map((line, lIdx) => {
              if (!line.trim()) return <div key={lIdx} className="h-1.5" />;
              
              const lineParts = line.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g);
              const formattedLine = lineParts.map((segment, sIdx) => {
                if ((segment.startsWith("**") && segment.endsWith("**")) || (segment.startsWith("*") && segment.endsWith("*"))) {
                  return <strong key={sIdx} className="text-white font-black">{segment.replace(/\*/g, "")}</strong>;
                }
                const linkMatch = segment.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                  const label = linkMatch[1];
                  const url = linkMatch[2];
                  const isDownload = label.toLowerCase().includes('download') || label.toLowerCase().includes('baixar');
                  return (
                    <a key={sIdx} href={url} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-2 transition-all font-black", isDownload ? "bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-xl hover:bg-accent/20" : "text-accent hover:underline")}>
                      {isDownload && <Download className="w-3 h-3" />}
                      {label}
                      {!isDownload && <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />}
                    </a>
                  );
                }
                return segment;
              });
              return <p key={lIdx} className="text-[15px] leading-relaxed text-white break-words w-full">{formattedLine}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "search">("chat");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [userName, setUserName] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isComplete = localStorage.getItem("xzafe_setup_complete");
    if (!isComplete) router.push("/setup");
    else {
      const storedData = localStorage.getItem("xzafe_user_data");
      if (storedData) setUserName(JSON.parse(storedData).chamado || "");
    }
  }, [router]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading, viewMode]);

  const handleSystemExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const base64 = await exportProjectSource();
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
      
      const blob = new Blob([array], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `XZAFE_SYSTEM_SOURCE_BACKUP.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao exportar sistema:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        if (attachedFiles.filter(f => f.type === 'image').length >= 5) continue;
        reader.onload = (ev) => {
          const base64 = ev.target?.result as string;
          setAttachedFiles(prev => [...prev, {
            id: Math.random().toString(36),
            name: file.name,
            type: 'image',
            data: base64,
            preview: base64
          }]);
        };
        reader.readAsDataURL(file);
      } else if (file.name.endsWith('.zip')) {
        const zip = new JSZip();
        const content = await zip.loadAsync(file);
        let tree = "ÁRVORE GENEALÓGICA DO PROJETO:\n";
        let allText = "CONTEÚDO DOS ARQUIVOS:\n";

        for (const [path, zipFile] of Object.entries(content.files)) {
          tree += `  - ${path}\n`;
          if (!zipFile.dir) {
            const isText = [".txt", ".js", ".ts", ".html", ".css", ".lua", ".json", ".md", ".xml", ".py"].some(ext => path.endsWith(ext));
            if (isText) {
              const text = await zipFile.async("string");
              allText += `\nFILE: ${path}\n${text}\n---\n`;
            }
          }
        }
        
        setAttachedFiles(prev => [...prev, {
          id: Math.random().toString(36),
          name: file.name,
          type: 'zip',
          data: `${tree}\n\n${allText}`
        }]);
      } else {
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          setAttachedFiles(prev => [...prev, {
            id: Math.random().toString(36),
            name: file.name,
            type: 'text',
            data: text
          }]);
        };
        reader.readAsText(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSynthesize = async () => {
    if (searchResults.length === 0 || isLoading) return;
    const searchContext = searchResults.map(r => `Site: ${r.site}\nSnippet: ${r.snippet}\nURL: ${r.url}`).join("\n\n");
    const prompt = `Analise esses resultados de busca e crie um resumo técnico definitivo. Inclua datas de lançamento, links de download e conclusões. Use get:HTTPS/OPT--OS/ no início.\n\n${searchContext}`;
    
    setMessages(prev => [...prev, { role: "user", content: "Sintetizar resultados da busca..." }]);
    setViewMode("chat");
    setIsLoading(true);

    try {
      const response = await handleMessage(prompt, false);
      setMessages(prev => [...prev, { role: "assistant", content: response.content, type: response.type }]);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  async function handleSend() {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const query = input.trim();
    const currentAttachments = [...attachedFiles];
    setInput("");
    setAttachedFiles([]);

    if (viewMode === "search") {
      setIsLoading(true);
      try {
        const prompt = `Gere 5 resultados REAIS para: "${query}". Retorne JSON array format: [{site, title, snippet, url}].`;
        const response = await handleMessage(prompt, false);
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) setSearchResults(JSON.parse(jsonMatch[0]));
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: query || "Injeção Multi-Modal de Arquivo(s)" }]);
    setIsLoading(true);

    const attachmentsForIA: AIAttachment[] = currentAttachments.map(f => ({
      type: f.type === 'image' ? 'image' : 'text',
      data: f.data,
      name: f.name
    }));

    if (isImageMode) {
      setMessages((prev) => [...prev, { role: "assistant", content: "", type: "image", isGenerating: true }]);
    }

    try {
      const response = await handleMessage(query, isImageMode, attachmentsForIA);
      setMessages((prev) => {
        const newMsg = [...prev];
        const last = newMsg[newMsg.length - 1];
        if (last?.isGenerating) {
          newMsg[newMsg.length - 1] = { role: "assistant", content: response.content, type: response.type, projectData: response.projectData, isGenerating: false };
        } else {
          newMsg.push({ role: "assistant", content: response.content, type: response.type, projectData: response.projectData });
        }
        return newMsg;
      });
    } catch (e: any) {
      setMessages((prev) => [...prev.filter(m => !m.isGenerating), { role: "assistant", content: `❌ Erro: ${e.message}`, type: "text" }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-[100dvh] bg-[#0a0a0a] text-white overflow-hidden dark font-body">
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/[0.03] shrink-0">
        <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5 text-zinc-500" /></Link>
        <h1 className="text-[10px] font-black tracking-[0.4em] text-white uppercase opacity-80">{viewMode === "chat" ? "XZAFE terminal" : "XZAFE search engine"}</h1>
        <Sheet>
          <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button></SheetTrigger>
          <SheetContent className="bg-[#0f0f0f] border-l border-white/5 text-white">
            <SheetHeader>
              <SheetTitle className="text-white italic uppercase">Configuração</SheetTitle>
              <SheetDescription className="text-zinc-500 text-[10px] uppercase tracking-widest">XZAFE OSX v2.5.0</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-12">
              <Button onClick={() => setViewMode("chat")} className={cn("w-full justify-start gap-4 h-14 rounded-2xl", viewMode === "chat" ? "bg-accent text-black" : "bg-white/5")}>
                <MessageSquare className="w-5 h-5" /> MODO CHAT
              </Button>
              <Button onClick={() => setViewMode("search")} className={cn("w-full justify-start gap-4 h-14 rounded-2xl", viewMode === "search" ? "bg-accent text-black" : "bg-white/5")}>
                <LayoutGrid className="w-5 h-5" /> BUSCA AVANÇADA
              </Button>
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-600 mb-4">Mover Sistema (Backup)</p>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Use o botão abaixo para baixar o código-fonte COMPLETO deste sistema. Depois, importe este código na sua outra conta Firebase via GitHub.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleSystemExport}
                    disabled={isExporting}
                    className="w-full border-accent/20 text-accent gap-2 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/10"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                    {isExporting ? "EXPORTANDO..." : "BAIXAR CÓDIGO FONTE (ZIP)"}
                  </Button>
                  <Button variant="ghost" className="w-full text-zinc-500 text-[9px] uppercase tracking-widest font-black h-10">
                    <Info className="w-3.5 h-3.5 mr-2" /> GUIA DE IMPORTAÇÃO
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <ScrollArea ref={scrollRef} className="flex-1 w-full no-scrollbar">
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-16">
          {viewMode === "search" && searchResults.length > 0 ? (
            <div className="grid gap-6 animate-in fade-in duration-700">
              {searchResults.map((res, idx) => (
                <div key={idx} className="p-6 rounded-[28px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                       <Globe className="w-4 h-4 text-accent" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-zinc-500">{res.site}</span>
                   </div>
                   <h3 className="text-lg font-black text-white mb-2 group-hover:text-accent transition-colors">{res.title}</h3>
                   <p className="text-sm text-zinc-400 leading-relaxed mb-4">{res.snippet}</p>
                   <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                     ACESSAR FONTE <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in-95 duration-1000">
              <div className="w-24 h-24 rounded-[32px] bg-white/[0.03] flex items-center justify-center border border-white/10 mb-10"><Terminal className="w-10 h-10 text-white opacity-80" /></div>
              <h2 className="text-4xl font-black text-white uppercase italic">{userName ? `Olá, ${userName}` : "Bem-vindo"}</h2>
              <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-600 mt-4 font-black">Sistema Operacional de Elite</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={cn("flex flex-col w-full animate-in fade-in slide-in-from-bottom-4", msg.role === "user" ? "items-end" : "items-start")}>
                {msg.role === "user" ? (
                  <div className="bg-[#1a1a1a] px-6 py-3.5 rounded-2xl max-w-[90%] border border-white/[0.08] shadow-xl"><p className="text-[15px] font-semibold">{msg.content}</p></div>
                ) : (
                  <div className="w-full">{msg.isGenerating || msg.type === "image" ? <ImageBlock url={msg.content} isGenerating={msg.isGenerating} /> : msg.type === "project" ? <ProjectGenerator project={msg.projectData!} /> : <FormattedMessage content={msg.content} />}</div>
                )}
              </div>
            ))
          )}
          {isLoading && !messages.some(m => m.isGenerating) && <div className="animate-pulse text-[10px] uppercase font-black tracking-widest text-accent">Processando Engine...</div>}
        </div>
      </ScrollArea>

      <footer className="px-4 py-6 border-t border-white/[0.02] space-y-4 shrink-0">
        {attachedFiles.length > 0 && (
          <div className="max-w-4xl mx-auto flex gap-3 overflow-x-auto pb-2 no-scrollbar animate-in slide-in-from-bottom-2">
            {attachedFiles.map(file => (
              <div key={file.id} className="relative shrink-0 w-16 h-16 rounded-xl border border-white/10 bg-zinc-900 group">
                {file.type === 'image' ? (
                  <img src={file.preview} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {file.type === 'zip' ? <FileArchive className="w-6 h-6 text-accent" /> : <FileText className="w-6 h-6 text-zinc-500" />}
                  </div>
                )}
                <button 
                  onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={cn("max-w-4xl mx-auto flex items-end gap-2 rounded-[28px] border p-2 transition-all duration-700", isImageMode ? "bg-accent/5 border-accent/20" : "bg-[#141414] border-white/[0.05]")}>
          <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
          
          {viewMode === "search" ? (
             <button 
               onClick={handleSynthesize} 
               disabled={searchResults.length === 0 || isLoading}
               className={cn("p-3.5 rounded-full transition-all", searchResults.length > 0 ? "text-accent bg-accent/10" : "text-zinc-600")}
               title="Sintetizar Resultados"
             >
               <Sparkles className={cn("w-5 h-5", isLoading && "animate-spin")} />
             </button>
          ) : (
            <button onClick={() => setIsImageMode(!isImageMode)} className={cn("p-3.5 rounded-full transition-all", isImageMode ? "bg-accent text-black" : "text-zinc-500 hover:text-white")} title="Modo Imagem"><ImageIcon className="w-5 h-5" /></button>
          )}

          <button onClick={() => fileInputRef.current?.click()} className="p-3.5 text-zinc-500 hover:text-white transition-colors" title="Anexar Arquivos"><Paperclip className="w-5 h-5" /></button>
          
          <textarea
            ref={textareaRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={viewMode === "search" ? "O que você deseja buscar hoje?" : (isImageMode ? "Descreva sua arte de elite..." : "Terminal XZAFE: Mensagem ou Arquivo...")}
            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-3.5 px-3 resize-none max-h-[150px] text-white"
          />
          
          <button onClick={handleSend} disabled={isLoading || (!input.trim() && attachedFiles.length === 0)} className={cn("p-3.5 rounded-full transition-all", input.trim() || attachedFiles.length > 0 ? "bg-white text-black" : "bg-zinc-900 text-zinc-700 opacity-50")}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </footer>
    </main>
  );
}
