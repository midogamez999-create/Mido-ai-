import React, { useState, useRef } from 'react';
import { Mode, FileAttachment, UserSecrets } from '../types';
import { soundFx } from '../lib/soundFx';
import { PluginSelectorBar } from './PluginSelectorBar';
import {
  Sparkles,
  Paperclip,
  Send,
  Square,
  Mic,
  MicOff,
  Image as ImageIcon,
  Code2,
  Video,
  Music,
  MessageSquare,
  X,
  FileCode,
  FileArchive,
  FileText,
  File,
  Smartphone,
  Scan,
  Wand2,
  RefreshCw,
  Volume2,
} from 'lucide-react';

interface OmniPromptBarProps {
  onSendPrompt: (prompt: string, mode: Mode, attachments?: string[], fileAttachments?: FileAttachment[]) => void;
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  secrets?: UserSecrets;
  onOpenPluginStore?: () => void;
}

function detectFileCategory(fileName: string, mimeType: string): FileAttachment['category'] {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'apk' || ext === 'aab') return 'apk';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'].includes(ext)) return 'zip';
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'php', 'rb', 'html', 'css', 'json', 'sql', 'sh', 'yaml', 'yml'].includes(ext)) return 'code';
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'csv', 'xlsx', 'pptx'].includes(ext)) return 'document';
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (mimeType.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) return 'video';
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) return 'audio';
  return 'binary';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const OmniPromptBar: React.FC<OmniPromptBarProps> = ({
  onSendPrompt,
  currentMode,
  onSelectMode,
  isLoading,
  onStopGeneration,
  secrets,
  onOpenPluginStore,
}) => {
  const [prompt, setPrompt] = useState('');
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnhancePrompt = async () => {
    if (isEnhancing) return;
    const baseText = prompt.trim() || 'Create an insane cutting-edge web project';
    soundFx.playClick();
    setIsEnhancing(true);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: baseText,
          category: currentMode === 'app-studio' ? 'code' : 'general',
          secrets,
        }),
      });
      const data = await res.json();
      if (data.success && data.enhancedPrompt) {
        soundFx.playSuccess();
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Failed to enhance prompt:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const modeOptions: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'face-detect', label: 'Face Detect', icon: <Scan className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'app-studio', label: 'Mido Builder 🚀', icon: <Code2 className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'photo-studio', label: 'Photo Studio', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'video-studio', label: 'Video Studio', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'music-studio', label: 'Music Studio', icon: <Music className="w-3.5 h-3.5" /> },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundFx.playClick();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const category = detectFileCategory(file.name, file.type);
      const isTextOrCode = category === 'code' || category === 'document' || ['json', 'txt', 'md', 'csv', 'html', 'css', 'js', 'ts', 'py'].includes(ext);

      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result;
        if (!result) return;

        const newAttachment: FileAttachment = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: result as string,
          category,
          extension: ext,
        };

        // For code or text files under 2MB, extract textual preview
        if (isTextOrCode && typeof result === 'string') {
          if (!result.startsWith('data:')) {
            newAttachment.parsedPreview = result.slice(0, 12000);
          }
        }

        setFileAttachments((prev) => [...prev, newAttachment]);
      };

      if (isTextOrCode && file.size < 2 * 1024 * 1024) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFileAttachment = (id: string) => {
    soundFx.playClick();
    setFileAttachments((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported by your browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      soundFx.playVoiceEnd();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      soundFx.playVoiceStart();
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setPrompt(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && fileAttachments.length === 0) return;
    soundFx.playSent();

    const mediaAttachments = fileAttachments
      .filter((f) => f.category === 'image' || f.category === 'video')
      .map((f) => f.dataUrl);

    onSendPrompt(prompt, currentMode, mediaAttachments, fileAttachments);
    setPrompt('');
    setFileAttachments([]);
  };

  const getCategoryIcon = (category: FileAttachment['category']) => {
    switch (category) {
      case 'apk':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'zip':
        return <FileArchive className="w-4 h-4 text-amber-400" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-pink-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-teal-400" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="sticky bottom-0 z-30 w-full p-3 sm:p-4 md:pb-6">
      <div className="max-w-4xl mx-auto bg-slate-950/80 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-2.5">
        {/* Mode Pill Switcher & ChatGPT Plugins Selector */}
        <div className="flex items-center justify-between gap-2 px-2 pb-2 mb-2 border-b border-white/10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {modeOptions.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectMode(m.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 transition-all ${
                  currentMode === m.id
                    ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {currentMode === 'chat' && onOpenPluginStore && (
            <div className="shrink-0 ml-auto">
              <PluginSelectorBar onOpenStore={onOpenPluginStore} />
            </div>
          )}
        </div>

        {/* Voice listening status indicator */}
        {isListening && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-2 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-red-200 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold">Listening Voice...</span>
              <span className="text-red-300 text-[11px] hidden sm:inline">Speak clearly into your microphone</span>
            </div>
            <button
              type="button"
              onClick={toggleVoice}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/30 hover:bg-red-500/50 text-white"
            >
              Done / Stop
            </button>
          </div>
        )}

        {/* Multi-Format File Attachments Preview (APK, ZIP, Code, Docs, Media) */}
        {fileAttachments.length > 0 && (
          <div className="flex items-center gap-2 px-2 pb-2 overflow-x-auto no-scrollbar">
            {fileAttachments.map((file) => (
              <div
                key={file.id}
                className="relative group flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white shrink-0 shadow-md"
              >
                {file.category === 'image' && file.dataUrl.startsWith('data:image') ? (
                  <img src={file.dataUrl} alt={file.name} className="w-8 h-8 rounded-lg object-cover border border-white/20" />
                ) : (
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                    {getCategoryIcon(file.category)}
                  </div>
                )}
                <div className="max-w-[130px]">
                  <p className="text-[11px] font-bold text-white truncate">{file.name}</p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    <span className="uppercase font-bold text-indigo-300 mr-1">{file.extension || file.category}</span>
                    {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFileAttachment(file.id)}
                  className="p-1 rounded-full hover:bg-red-500/30 text-slate-400 hover:text-red-300 transition-colors ml-1"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="*"
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              fileInputRef.current?.click();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0"
            title="Attach Any File (APK, ZIP, Code, PDF, Photos, Video, Audio)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              fileAttachments.length > 0
                ? `Attached ${fileAttachments.length} file(s). Ask me to analyze APK, inspect ZIP, debug code, or explain...`
                : currentMode === 'app-studio'
                ? "Describe the app to build (e.g., 'Travel app with cinematic video and lo-fi beats')..."
                : currentMode === 'photo-studio'
                ? "Describe the photo to synthesize or edit..."
                : currentMode === 'video-studio'
                ? "Describe the video scene to render..."
                : currentMode === 'music-studio'
                ? "Describe the soundtrack style to compose..."
                : "Ask mido.ai anything, send APK / ZIP / any files, or create web apps..."
            }
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none min-w-0"
          />

          <button
            type="button"
            onClick={handleEnhancePrompt}
            disabled={isEnhancing}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              isEnhancing
                ? 'bg-amber-500/30 text-amber-300 animate-spin'
                : 'text-amber-400 hover:text-amber-200 hover:bg-amber-500/10'
            }`}
            title="Magic Prompt Enhancer (Supercharge your prompt with AI)"
          >
            {isEnhancing ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              isListening ? 'bg-red-500/20 text-red-300 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Voice Input (Speech-to-Text)"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              const textToSpeak = prompt.trim() || 'Hello! I am Mido Talking Tool with real-time neural audio.';
              onSendPrompt(`Use talking tool to speak: ${textToSpeak}`, currentMode);
              setPrompt('');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shadow-sm shrink-0 active:scale-95"
            title="Mido Talking Tool: Synthesize Speech & Read Out Loud"
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Talking Tool</span>
          </button>

          {isLoading ? (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                if (onStopGeneration) onStopGeneration();
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-red-500/40 shrink-0 animate-pulse"
              title="Stop Generating (Immediate Cancel)"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!prompt.trim() && fileAttachments.length === 0}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/40 shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

