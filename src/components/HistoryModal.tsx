import React, { useState } from 'react';
import {
  ChatSession,
  GeneratedImage,
  GeneratedVideo,
  GeneratedTrack,
  AppProject,
  Mode,
} from '../types';
import {
  History,
  X,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Music,
  Code2,
  Trash2,
  Edit3,
  Check,
  Download,
  PlusCircle,
  Play,
  ArrowRight,
  Search,
  Sparkles,
  Clock,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  generatedImages: GeneratedImage[];
  generatedVideos: GeneratedVideo[];
  generatedTracks: GeneratedTrack[];
  savedApps: AppProject[];
  onSelectMode: (mode: Mode) => void;
  onSelectApp?: (app: AppProject) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
  generatedImages,
  generatedVideos,
  generatedTracks,
  savedApps,
  onSelectMode,
  onSelectApp,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'photos' | 'videos' | 'music' | 'apps'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleExportSession = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chat_history_${session.id}_${session.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered lists
  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredImages = generatedImages.filter((img) =>
    img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = generatedVideos.filter((vid) =>
    vid.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTracks = generatedTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApps = savedApps.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Top Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">History &amp; Stored Vault</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AUTO-SAVED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Access past chat sessions, complete ongoing conversations, and view stored media.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewSession}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Chat</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Tab Navigation */}
        <div className="p-4 border-b border-white/10 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'chats'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chats ({sessions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({generatedImages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'videos'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({generatedVideos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'music'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music ({generatedTracks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('apps')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'apps'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Apps ({savedApps.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* TAB 1: Chat Sessions */}
          {activeTab === 'chats' && (
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Chat Sessions Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No chat history matching your search criteria.'
                      : 'You do not have any saved chat history yet. Start asking questions or generating content!'}
                  </p>
                  <button
                    onClick={onNewSession}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Start New Conversation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSessions.map((session) => {
                    const isCurrent = session.id === currentSessionId;
                    const isEditing = editingSessionId === session.id;
                    const lastMessage = session.messages[session.messages.length - 1];
                    const mediaOutputsCount = session.messages.filter((m) => m.mediaOutput).length;

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/[0.07]'
                        }`}
                      >
                        <div>
                          {/* Card Top Row */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className={`p-2 rounded-xl text-white ${
                                  isCurrent ? 'bg-purple-600' : 'bg-white/10'
                                }`}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </div>

                              {isEditing ? (
                                <form
                                  onSubmit={(e) => handleSaveRename(session.id, e)}
                                  className="flex items-center gap-1 flex-1"
                                >
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-2 py-1 bg-slate-950 border border-purple-500 rounded-lg text-xs text-white font-bold focus:outline-none w-full"
                                    autoFocus
                                  />
                                  <button
                                    type="submit"
                                    onClick={(e) => handleSaveRename(session.id, e)}
                                    className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              ) : (
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                                    {session.title}
                                  </h3>
                                  <button
                                    onClick={(e) => handleStartRename(session, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                                    title="Rename chat session"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {isCurrent && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ACTIVE
                              </span>
                            )}
                          </div>

                          {/* Last message preview */}
                          <div className="text-[11px] text-slate-300 line-clamp-2 my-2 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                            {lastMessage ? (
                              <span>
                                <strong className="text-slate-400 capitalize">{lastMessage.role}: </strong>
                                {lastMessage.content.replace(/[#*`]/g, '').slice(0, 120)}
                              </span>
                            ) : (
                              <span className="italic text-slate-500">Empty conversation</span>
                            )}
                          </div>
                        </div>

                        {/* Card Bottom Meta & Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-slate-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {session.updatedAt}
                            </span>
                            <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                              <Layers className="w-3 h-3 text-purple-400" />
                              {session.messages.length} msgs
                            </span>
                            {mediaOutputsCount > 0 && (
                              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20">
                                <Sparkles className="w-3 h-3" />
                                {mediaOutputsCount} media
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleExportSession(session, e)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              title="Download chat JSON"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {sessions.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this chat session history?')) {
                                    onDeleteSession(session.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title="Delete session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSession(session.id);
                                onClose();
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] shadow-sm transition-all ml-1"
                            >
                              <span>Complete &amp; Resume</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {sessions.length > 1 && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm('Clear all chat session history? This cannot be undone.')) {
                        onClearAllSessions();
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Chat History</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Stored Photos */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              {filteredImages.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6 text-pink-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Stored Photos Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Generate images in Photo Studio or AI Chat to store them in your permanent vault.
                  </p>
                  <button
                    onClick={() => {
                      onSelectMode('photo-studio');
                      onClose();
                    }}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Open Photo Studio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-pink-500/40"
                    >
                      <div className="aspect-square relative overflow-hidden bg-slate-950">
                        <img
                          src={img.url}
                          alt={img.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                          <p className="text-[10px] text-white font-medium line-clamp-2">{img.prompt}</p>
                          <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/20">
                            <span className="text-[9px] text-pink-300 font-bold">{img.aspectRatio}</span>
                            <a
                              href={img.url}
                              download={`photo_${img.id}.png`}
                              className="p-1 rounded-lg bg-pink-600 text-white hover:bg-pink-500"
                              title="Download Photo"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 text-[10px] text-slate-400 truncate flex items-center justify-between">
                        <span className="truncate">{img.prompt}</span>
                        <span className="text-slate-500 shrink-0 ml-1">{img.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Stored Videos */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              {filteredVideos.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
                    <Video className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Stored Videos Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Generate videos in Video Studio or AI Chat to view and store video renders here.
                  </p>
                  <button
                    onClick={() => {
                      onSelectMode('video-studio');
                      onClose();
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Open Video Studio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-amber-500/40 transition-all"
                    >
                      <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-white/10 relative group">
                        {vid.url ? (
                          <video
                            src={vid.url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-400 text-xs">
                            Generating video render...
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                          <span className="truncate flex-1 pr-2">{vid.prompt}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                            {vid.aspectRatio || '16:9'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Created {vid.createdAt}</span>
                          {vid.url && (
                            <a
                              href={vid.url}
                              download={`video_${vid.id}.mp4`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download MP4</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Stored Music */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              {filteredTracks.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
                    <Music className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Stored Soundtracks Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Compose soundtracks in Music Studio to save custom audio files here.
                  </p>
                  <button
                    onClick={() => {
                      onSelectMode('music-studio');
                      onClose();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Open Music Studio
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-md">
                          <Music className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{track.prompt}</p>
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md inline-block mt-1">
                            {track.genre}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <audio src={track.audioUrl} controls className="h-8 max-w-[200px]" />
                        <a
                          href={track.audioUrl}
                          download={`${track.title}.wav`}
                          className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                          title="Download audio track"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Stored Web Apps */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 hover:border-indigo-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white">{app.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400">{app.updatedAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{app.description}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          if (onSelectApp) onSelectApp(app);
                          onSelectMode('app-studio');
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Launch App</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All chats, images &amp; media are locally saved in your session history vault.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};
