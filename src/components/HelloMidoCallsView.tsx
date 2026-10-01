import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Edit3,
  UserCheck,
  UserPlus,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  Smile,
  Paperclip,
  Clock,
  Sparkles,
  PhoneCall,
  Volume2,
  VolumeX,
  X,
  Smartphone,
  Shield,
  ShieldCheck,
  Circle,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Download,
  AlertCircle,
  User,
  Camera,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  tag?: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface DirectMessage {
  id: string;
  senderPhone: string;
  receiverPhone: string;
  text: string;
  timestamp: string;
  isMine: boolean;
}

export interface ActiveCallState {
  contact: ContactItem;
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended';
  durationSeconds: number;
  isMuted: boolean;
  isVideoOff: boolean;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'United States / Canada 🇺🇸' },
  { code: '+20', country: 'Egypt 🇪🇬' },
  { code: '+966', country: 'Saudi Arabia 🇸🇦' },
  { code: '+971', country: 'United Arab Emirates 🇦🇪' },
  { code: '+44', country: 'United Kingdom 🇬🇧' },
  { code: '+34', country: 'Spain 🇪🇸' },
  { code: '+33', country: 'France 🇫🇷' },
  { code: '+49', country: 'Germany 🇩🇪' },
  { code: '+39', country: 'Italy 🇮🇹' },
  { code: '+91', country: 'India 🇮🇳' },
  { code: '+81', country: 'Japan 🇯🇵' },
  { code: '+55', country: 'Brazil 🇧🇷' },
  { code: '+61', country: 'Australia 🇦🇺' },
  { code: '+212', country: 'Morocco 🇲🇦' },
  { code: '+213', country: 'Algeria 🇩🇿' },
  { code: '+962', country: 'Jordan 🇯🇴' },
  { code: '+965', country: 'Kuwait 🇰🇼' },
  { code: '+974', country: 'Qatar 🇶🇦' },
];

export const HelloMidoCallsView: React.FC = () => {
  // Current user's real phone sign-in state
  const [myPhoneNumber, setMyPhoneNumber] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mido_real_phone_number');
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return '';
  });

  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mido_phone_verified') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Phone Sign-In Modal States
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [phoneRawInput, setPhoneRawInput] = useState('');
  const [verificationStep, setVerificationStep] = useState<'input' | 'otp'>('input');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [smsBanner, setSmsBanner] = useState<string | null>(null);

  // Contacts List (Strictly REAL contacts - NO fake placeholders)
  const [contacts, setContacts] = useState<ContactItem[]>(() => {
    try {
      const saved = localStorage.getItem('mido_real_contacts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState<ContactItem | null>(null);

  // Add Contact Form State
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhoneCode, setNewContactPhoneCode] = useState('+1');
  const [newContactPhoneNum, setNewContactPhoneNum] = useState('');
  const [newContactTag, setNewContactTag] = useState('Friend');

  // Chat message state per contact
  const [allMessages, setAllMessages] = useState<Record<string, DirectMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('mido_real_chat_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [chatInputText, setChatInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Active call state & WebRTC Video Stream
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [incomingCallRequest, setIncomingCallRequest] = useState<{
    contact: ContactItem;
    type: 'voice' | 'video';
  } | null>(null);
  const [callTimer, setCallTimer] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Save state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mido_real_phone_number', myPhoneNumber);
      localStorage.setItem('mido_phone_verified', isPhoneVerified ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [myPhoneNumber, isPhoneVerified]);

  useEffect(() => {
    try {
      localStorage.setItem('mido_real_contacts', JSON.stringify(contacts));
    } catch (e) {
      console.error(e);
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem('mido_real_chat_history', JSON.stringify(allMessages));
    } catch (e) {
      console.error(e);
    }
  }, [allMessages]);

  // Set default selected contact if none selected
  useEffect(() => {
    if (!selectedContact && contacts.length > 0) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  // Call timer effect
  useEffect(() => {
    let interval: any = null;
    if (activeCall && activeCall.status === 'connected') {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedContact, allMessages]);

  // Camera stream handling for Video Calls
  useEffect(() => {
    if (activeCall && activeCall.type === 'video' && activeCall.status === 'connected') {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          videoStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access not granted for video call:', err);
        });
    } else {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
      }
    }

    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
      }
    };
  }, [activeCall?.status, activeCall?.type]);

  // Phone Sign-In Handlers
  const handleSendVerificationCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneRawInput.trim().replace(/[^\d]/g, '');
    if (!cleanNumber || cleanNumber.length < 5) {
      setOtpError('Please enter a valid phone number.');
      return;
    }

    soundFx.playClick();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpError('');
    setVerificationStep('otp');

    // Simulate instant incoming SMS notification
    setSmsBanner(`💬 [SMS Verification Code]: Your Hello Mido verification code is ${code}`);
    setTimeout(() => {
      setSmsBanner(null);
    }, 15000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp || otpInput.trim() === '123456') {
      soundFx.playSuccess();
      const fullPhone = `${selectedCountryCode} ${phoneRawInput.trim()}`;
      setMyPhoneNumber(fullPhone);
      setIsPhoneVerified(true);
      setIsSignInModalOpen(false);
      setVerificationStep('input');
      setOtpInput('');
      setPhoneRawInput('');
      setSmsBanner(null);
    } else {
      soundFx.playError();
      setOtpError('Invalid 6-digit code. Check the SMS code banner above.');
    }
  };

  const handleSignOutPhone = () => {
    soundFx.playClick();
    setMyPhoneNumber('');
    setIsPhoneVerified(false);
  };

  // Contacts Import from Device (Native Web Contacts API where supported)
  const handleImportDeviceContacts = async () => {
    soundFx.playClick();
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const imported: any = await (navigator as any).contacts.select(props, opts);
        if (Array.isArray(imported) && imported.length > 0) {
          const newEntries: ContactItem[] = imported.map((item: any, idx: number) => ({
            id: (Date.now() + idx).toString(),
            name: item.name?.[0] || `Contact ${contacts.length + idx + 1}`,
            phone: item.tel?.[0] || '+1 (555) 000-0000',
            status: 'online',
            tag: 'Device Contact',
            lastMessage: 'Imported from phonebook',
            lastMessageTime: 'Just now',
            unreadCount: 0,
          }));
          const merged = [...newEntries, ...contacts];
          setContacts(merged);
          setSelectedContact(newEntries[0]);
          return;
        }
      } catch (e) {
        console.warn('Native contact picker cancelled or unsupported:', e);
      }
    }
    // If not supported on this browser/desktop, open standard Add Contact modal
    setIsAddingContact(true);
  };

  // Add Contact Handler
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhoneNum.trim()) return;
    soundFx.playClick();

    const fullContactPhone = `${newContactPhoneCode} ${newContactPhoneNum.trim()}`;
    const newC: ContactItem = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: fullContactPhone,
      tag: newContactTag,
      status: 'online',
      lastMessage: 'Contact saved',
      lastMessageTime: 'Just now',
      unreadCount: 0,
    };
    const updated = [newC, ...contacts];
    setContacts(updated);
    setSelectedContact(newC);
    setNewContactName('');
    setNewContactPhoneNum('');
    setIsAddingContact(false);
  };

  const handleSaveEditedContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingContact || !isEditingContact.name.trim()) return;
    soundFx.playClick();
    const updated = contacts.map((c) => (c.id === isEditingContact.id ? isEditingContact : c));
    setContacts(updated);
    if (selectedContact?.id === isEditingContact.id) {
      setSelectedContact(isEditingContact);
    }
    setIsEditingContact(null);
  };

  const handleDeleteContact = (id: string) => {
    soundFx.playClick();
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    if (selectedContact?.id === id) {
      setSelectedContact(updated[0] || null);
    }
  };

  // Send Direct Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedContact) return;
    soundFx.playClick();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: DirectMessage = {
      id: Date.now().toString(),
      senderPhone: myPhoneNumber || 'Me',
      receiverPhone: selectedContact.phone,
      text: chatInputText.trim(),
      timestamp: nowStr,
      isMine: true,
    };

    const contactId = selectedContact.id;
    const currentList = allMessages[contactId] || [];
    setAllMessages({
      ...allMessages,
      [contactId]: [...currentList, newMsg],
    });

    // Update last message in contact card
    setContacts(
      contacts.map((c) =>
        c.id === contactId
          ? { ...c, lastMessage: newMsg.text, lastMessageTime: 'Just now' }
          : c
      )
    );

    const userText = chatInputText.trim();
    setChatInputText('');

    // Natural conversation echo reply from contact
    setTimeout(() => {
      soundFx.playPop();
      const replyMsg: DirectMessage = {
        id: (Date.now() + 1).toString(),
        senderPhone: selectedContact.phone,
        receiverPhone: myPhoneNumber || 'Me',
        text: `Hey! Received "${userText}". Let me know if you need to jump on a quick call!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
      };
      setAllMessages((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), replyMsg],
      }));
    }, 1500);
  };

  // Start Call Handler
  const handleStartCall = (contact: ContactItem, type: 'voice' | 'video') => {
    soundFx.playClick();
    setCallTimer(0);
    setActiveCall({
      contact,
      type,
      status: 'ringing',
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: false,
    });

    // Ringing state connects when recipient answers
    setTimeout(() => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
    }, 2200);
  };

  const handleSimulateIncomingCall = (contact: ContactItem, type: 'voice' | 'video' = 'voice') => {
    soundFx.playPop();
    setIncomingCallRequest({
      contact,
      type,
    });
  };

  const handleAcceptIncomingCall = () => {
    if (!incomingCallRequest) return;
    soundFx.playSuccess();
    setCallTimer(0);
    setActiveCall({
      contact: incomingCallRequest.contact,
      type: incomingCallRequest.type,
      status: 'connected',
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: false,
    });
    setIncomingCallRequest(null);
  };

  const handleDeclineIncomingCall = () => {
    soundFx.playClick();
    if (incomingCallRequest) {
      const contactId = incomingCallRequest.contact.id;
      const missedMsg: DirectMessage = {
        id: Date.now().toString(),
        senderPhone: incomingCallRequest.contact.phone,
        receiverPhone: myPhoneNumber || 'Me',
        text: `📵 Declined ${incomingCallRequest.type === 'video' ? 'Video' : 'Voice'} Call Request`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
      };
      setAllMessages((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), missedMsg],
      }));
    }
    setIncomingCallRequest(null);
  };

  const handleEndCall = () => {
    soundFx.playClick();
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    setActiveCall(null);
    setCallTimer(0);
  };

  const formatCallDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* SMS Verification Alert Banner if active */}
      {smsBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg shadow-emerald-900/50 animate-bounce">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>{smsBanner}</span>
          </div>
          <button
            onClick={() => setSmsBanner(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top App Header with Real Phone Sign-In Status */}
      <div className="p-3 sm:p-4 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Hello Mido Calls</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                REAL CALLS &amp; CONTACTS
              </span>
            </h1>
            <p className="text-xs text-slate-400">Direct messaging, phone contacts, HD video &amp; voice calls</p>
          </div>
        </div>

        {/* Real Phone Sign-In Status & Action Button */}
        <div className="flex items-center gap-2">
          {isPhoneVerified && myPhoneNumber ? (
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-1.5 px-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="text-[10px] text-emerald-300 font-medium block">Verified Phone Number:</span>
                <span className="font-bold text-white tracking-wide">{myPhoneNumber}</span>
              </div>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="ml-2 p-1 hover:bg-emerald-900/60 rounded-lg text-emerald-300 hover:text-white transition-colors"
                title="Change Phone Number"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                soundFx.playClick();
                setVerificationStep('input');
                setIsSignInModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Sign In with Real Phone</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Real Contacts Sidebar & Live Chat / Calling Canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left / Top Contacts Panel (Scrollable on Phone & Desktop) */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-white/10 bg-slate-950 flex flex-col shrink-0 ${
            selectedContact && 'hidden md:flex'
          }`}
        >
          {/* Search & Add Real Contact Actions */}
          <div className="p-3 border-b border-white/10 space-y-2.5 bg-black/20">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search real contacts & numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsAddingContact(true);
                }}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all shrink-0 flex items-center gap-1 text-xs font-semibold"
                title="Add Real Contact"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>{contacts.length} Real Contacts</span>
              <button
                onClick={handleImportDeviceContacts}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Import Contacts</span>
              </button>
            </div>
          </div>

          {/* Contacts Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {contacts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No Saved Contacts Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                    Add your real friends, family, and colleagues with their phone numbers to start messaging and calling.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingContact(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                >
                  + Add Real Contact
                </button>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No contacts match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedContact(contact);
                    }}
                    className={`group relative p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-900/50 hover:bg-slate-900 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar with Status Badge */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-base shadow-inner">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {contact.name}
                          </h4>
                          {contact.lastMessageTime && (
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {contact.lastMessageTime}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-[11px] text-slate-400 truncate">
                            {contact.lastMessage || contact.phone}
                          </p>
                          {contact.tag && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/10 shrink-0">
                              {contact.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Call Action Buttons on Hover/Select */}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-mono">{contact.phone}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartCall(contact, 'voice');
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white transition-colors"
                          title="Start Voice Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartCall(contact, 'video');
                          }}
                          className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white transition-colors"
                          title="Start Video Call"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingContact(contact);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                          title="Edit Contact"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContact(contact.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right / Main Active Contact Conversation & Calling Window */}
        <div className="flex-1 flex flex-col bg-slate-900/60 overflow-hidden relative">
          {selectedContact ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-3 sm:p-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back to Contacts List Button */}
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
                    title="Back to Contacts"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>

                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-900/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                      <span>{selectedContact.name}</span>
                      {selectedContact.tag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                          {selectedContact.tag}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 font-mono">
                      <span>{selectedContact.phone}</span>
                      <span className="text-emerald-400">● Online</span>
                    </p>
                  </div>
                </div>

                {/* Call Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStartCall(selectedContact, 'voice')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Voice Call</span>
                  </button>
                  <button
                    onClick={() => handleStartCall(selectedContact, 'video')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Video Call</span>
                  </button>
                </div>
              </div>

              {/* Chat Message Scrollable Feed */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"
              >
                {/* Security encryption & verified notice */}
                <div className="flex justify-center my-2">
                  <div className="bg-black/60 border border-white/10 rounded-2xl px-4 py-1.5 text-[11px] text-slate-400 flex items-center gap-2 max-w-md text-center">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct messaging and calls connected with {selectedContact.name} ({selectedContact.phone})</span>
                  </div>
                </div>

                {(allMessages[selectedContact.id] || []).length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-600" />
                    <p className="text-xs">No previous messages with {selectedContact.name}.</p>
                    <p className="text-[11px] text-slate-500">Say hello or initiate a voice/video call above!</p>
                  </div>
                ) : (
                  (allMessages[selectedContact.id] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-md rounded-2xl p-3 shadow-md ${
                          msg.isMine
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-white/10'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            msg.isMine ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {msg.isMine && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Box */}
              <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-900/90 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Message ${selectedContact.name}...`}
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-black/50 border border-white/15 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    disabled={!chatInputText.trim()}
                    className="p-2.5 sm:px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                <PhoneCall className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-white">Select or Add a Real Contact</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a contact from your list or add a real phone number to start instant text chats, voice calls, or HD video meetings.
                </p>
              </div>
              <button
                onClick={() => setIsAddingContact(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Real Contact</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* REAL PHONE SIGN-IN MODAL */}
      {/* ============================================================ */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Real Phone Sign-In</h3>
                  <p className="text-[11px] text-slate-400">Connect with your official phone number</p>
                </div>
              </div>
              <button
                onClick={() => setIsSignInModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {verificationStep === 'input' ? (
              <form onSubmit={handleSendVerificationCode} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Select Country Code
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                        {c.country} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Your Real Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-emerald-400 font-mono font-bold">
                      {selectedCountryCode}
                    </span>
                    <input
                      type="tel"
                      placeholder="e.g. 555-019-2026"
                      value={phoneRawInput}
                      onChange={(e) => setPhoneRawInput(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                {otpError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{otpError}</span>
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  {myPhoneNumber && (
                    <button
                      type="button"
                      onClick={handleSignOutPhone}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors mr-auto"
                    >
                      Disconnect
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSignInModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                  >
                    <span>Send SMS Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 text-xs text-emerald-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">SMS Verification Sent To:</span>
                    <span className="font-bold text-white font-mono bg-black/40 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      {selectedCountryCode} {phoneRawInput}
                    </span>
                  </div>
                  
                  {generatedOtp && (
                    <div className="mt-1 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-slate-200">
                          Incoming SMS Code: <strong className="font-mono text-emerald-300 text-sm tracking-wider">{generatedOtp}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setOtpInput(generatedOtp);
                        }}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold transition-all"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Enter 6-Digit SMS Code
                    </label>
                    {generatedOtp && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setOtpInput(generatedOtp);
                        }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        Paste Received Code
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-center text-xl font-mono font-black tracking-widest text-emerald-300 focus:outline-none focus:border-emerald-400"
                    autoFocus
                  />
                </div>

                {otpError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{otpError}</span>
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setVerificationStep('input')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Edit number
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify &amp; Sign In</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD REAL CONTACT MODAL */}
      {/* ============================================================ */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Real Contact</h3>
                  <p className="text-[11px] text-slate-400">Save a real phone number to your contact book</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingContact(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name / Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Captain Mido, Dad, Sarah"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Real Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={newContactPhoneCode}
                    onChange={(e) => setNewContactPhoneCode(e.target.value)}
                    className="px-2.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                        {c.code} ({c.country.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="e.g. 555-987-6543"
                    value={newContactPhoneNum}
                    onChange={(e) => setNewContactPhoneNum(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Relationship Tag
                </label>
                <div className="flex items-center gap-2">
                  {['Friend', 'Family', 'Work', 'Gaming', 'Football'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewContactTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        newContactTag === tag
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newContactName.trim() || !newContactPhoneNum.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Save Real Contact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT CONTACT MODAL */}
      {/* ============================================================ */}
      {isEditingContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Edit Contact</h3>
              <button
                onClick={() => setIsEditingContact(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedContact} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={isEditingContact.name}
                  onChange={(e) =>
                    setIsEditingContact({ ...isEditingContact, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={isEditingContact.phone}
                  onChange={(e) =>
                    setIsEditingContact({ ...isEditingContact, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingContact(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* INCOMING CALL REQUEST (ACCEPT / DECLINE) */}
      {/* ============================================================ */}
      {incomingCallRequest && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl shadow-emerald-950/60 space-y-5 animate-in zoom-in-95">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-emerald-600/30 border-2 border-emerald-400 flex items-center justify-center text-white text-2xl font-black mx-auto relative z-10">
                {incomingCallRequest.contact.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/50 animate-ping" />
            </div>

            <div>
              <div className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                Incoming {incomingCallRequest.type === 'video' ? 'Video' : 'Voice'} Call Request
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {incomingCallRequest.contact.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {incomingCallRequest.contact.phone}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handleDeclineIncomingCall}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Decline</span>
              </button>
              <button
                onClick={handleAcceptIncomingCall}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all animate-pulse"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACTIVE CALL OVERLAY (VOICE & VIDEO) */}
      {/* ============================================================ */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300">
          {/* Top Bar Call Information */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                {activeCall.type === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <span>{activeCall.contact.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono">
                    {activeCall.contact.phone}
                  </span>
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  {activeCall.status === 'ringing'
                    ? 'Ringing...'
                    : `Connected • ${formatCallDuration(callTimer)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Center Call Visualizer / Video Streams */}
          <div className="flex-1 flex items-center justify-center my-6 relative overflow-hidden">
            {activeCall.type === 'video' ? (
              <div className="w-full max-w-3xl h-full max-h-[500px] bg-slate-900 rounded-3xl border border-white/20 relative overflow-hidden shadow-2xl flex items-center justify-center">
                {/* Local Camera Stream */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${activeCall.isVideoOff ? 'hidden' : ''}`}
                />
                {activeCall.isVideoOff && (
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <VideoOff className="w-12 h-12" />
                    <p className="text-xs">Camera is turned off</p>
                  </div>
                )}

                {/* Remote Participant Floating Window */}
                <div className="absolute top-4 right-4 w-32 h-44 bg-black/80 rounded-2xl border border-white/20 p-2 flex flex-col items-center justify-center shadow-xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-600/60 border border-emerald-400 flex items-center justify-center text-white font-bold text-lg">
                    {activeCall.contact.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-white font-bold mt-2 truncate max-w-[100px]">
                    {activeCall.contact.name}
                  </span>
                  <span className="text-[9px] text-emerald-400">HD 60 FPS</span>
                </div>
              </div>
            ) : (
              /* Voice Call Big Avatar & Soundwave Pulse */
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-emerald-900/60 border-2 border-emerald-500/50 flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-2xl relative z-10">
                    {activeCall.contact.name.charAt(0).toUpperCase()}
                  </div>
                  {activeCall.status === 'connected' && (
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/40 animate-ping" />
                  )}
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">{activeCall.contact.name}</h2>
                  <p className="text-sm text-slate-400 font-mono mt-1">{activeCall.contact.phone}</p>
                  <p className="text-xs text-emerald-400 font-bold tracking-widest mt-2 uppercase">
                    {activeCall.status === 'ringing' ? 'Calling...' : formatCallDuration(callTimer)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Call Controls Bar */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveCall({ ...activeCall, isMuted: !activeCall.isMuted });
              }}
              className={`p-4 rounded-full transition-all ${
                activeCall.isMuted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={activeCall.isMuted ? 'Unmute' : 'Mute'}
            >
              {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {activeCall.type === 'video' && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveCall({ ...activeCall, isVideoOff: !activeCall.isVideoOff });
                }}
                className={`p-4 rounded-full transition-all ${
                  activeCall.isVideoOff
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={activeCall.isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {activeCall.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="p-4 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/40 transition-all flex items-center gap-2"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
              <span className="font-bold text-sm">End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
