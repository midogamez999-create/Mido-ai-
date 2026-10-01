import React, { useState, useEffect } from 'react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogleAuth,
  setupRecaptcha,
  sendPhoneOTPCode,
  verifyPhoneOTPCode,
} from '../lib/firebase';
import { UserAccount } from '../types';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import {
  Phone,
  Mail,
  Lock,
  User,
  Sparkles,
  Loader2,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Globe,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface RealAuthScreenProps {
  onSuccessAuth: (user: UserAccount) => void;
  onContinueAsGuest?: () => void;
  isModalView?: boolean;
  onCloseModal?: () => void;
}

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸 / 🇨🇦', name: 'USA / Canada' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
];

export const RealAuthScreen: React.FC<RealAuthScreenProps> = ({
  onSuccessAuth,
  onContinueAsGuest,
  isModalView = false,
  onCloseModal,
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'google'>('google');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');

  // Phone state
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Email state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status & Error
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Setup reCAPTCHA on mount for Phone Auth
  useEffect(() => {
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      setRecaptchaVerifier(verifier);
    } catch (e) {
      console.warn('reCAPTCHA setup notice:', e);
    }
  }, []);

  // Handle Send Phone OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }

    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    setIsLoading(true);
    setStatusText('Sending SMS verification code to your phone...');

    try {
      let verifier = recaptchaVerifier;
      if (!verifier) {
        verifier = setupRecaptcha('recaptcha-container');
        setRecaptchaVerifier(verifier);
      }

      const confirmation = await sendPhoneOTPCode(fullPhone, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setStatusText(`SMS OTP Sent to ${fullPhone}! Check your phone messages.`);
    } catch (err: any) {
      console.error('Phone Auth Error:', err);
      let userError = err.message || 'Failed to send SMS code.';
      if (err.code === 'auth/invalid-phone-number') {
        userError = 'Invalid phone number format. Please check your country code and digits.';
      } else if (err.code === 'auth/too-many-requests') {
        userError = 'Too many attempts. Please try again in a few minutes.';
      } else if (err.code === 'auth/captcha-check-failed') {
        userError = 'reCAPTCHA check failed. Please refresh and try again.';
      }
      setErrorMsg(userError);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify Phone OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code sent via SMS.');
      return;
    }

    if (!confirmationResult) {
      setErrorMsg('Session expired. Please request a new SMS code.');
      return;
    }

    setIsLoading(true);
    setStatusText('Verifying SMS Code & Authenticating...');

    try {
      const userAccount = await verifyPhoneOTPCode(confirmationResult, otpCode);
      setStatusText('Authentication successful! Welcome to mido3dch1.ai Studio.');
      onSuccessAuth(userAccount);
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      setErrorMsg(err.code === 'auth/invalid-verification-code' ? 'Invalid OTP code. Please try again.' : err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Auth
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setStatusText(emailMode === 'signup' ? 'Creating your real Firebase account...' : 'Authenticating user...');

    try {
      let userAccount: UserAccount;
      if (emailMode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        userAccount = await signUpWithEmail(email.trim(), password, fullName.trim());
      } else {
        userAccount = await signInWithEmail(email.trim(), password);
      }
      setStatusText('Authenticated successfully!');
      onSuccessAuth(userAccount);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let userError = err.message || 'Authentication failed.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        userError = 'Invalid email or password. Please try again or create an account.';
      } else if (err.code === 'auth/email-already-in-use') {
        userError = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        userError = 'Password should be at least 6 characters long.';
      }
      setErrorMsg(userError);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsLoading(true);
    setStatusText('Connecting to Google OAuth 2.0...');

    try {
      const userAccount = await signInWithGoogleAuth();
      setStatusText('Google Sign-In Successful!');
      onSuccessAuth(userAccount);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.info('Google auth popup closed by user');
        setStatusText('');
      } else {
        console.error('Google Auth Error:', err);
        setErrorMsg(err?.message || 'Google Sign-In failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = isModalView
    ? 'relative w-full max-w-lg bg-slate-950/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-100 overflow-hidden'
    : 'min-h-screen w-full bg-[#020617] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden';

  return (
    <div className={containerStyle}>
      {/* Background Cyber Ambient Blobs */}
      {!isModalView && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[160px]" />
          <div className="absolute top-[30%] right-[20%] w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[120px]" />
        </div>
      )}

      {/* Hidden Recaptcha Anchor */}
      <div id="recaptcha-container" />

      <div className={isModalView ? 'relative z-10 w-full' : 'relative z-10 w-full max-w-md bg-slate-950/80 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.25)] backdrop-blur-2xl'}>
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Firebase Real Security Auth</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>mido3dch1.ai Studio</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with any Smartphone, Email, or Google account to unlock full AI creation!
          </p>
        </div>

        {/* Auth Method Toggle Buttons */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'phone'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone SMS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'email'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Pass</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'google'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google 1-Tap</span>
          </button>
        </div>

        {/* Status & Error Toasts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusText && !errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusText}</span>
          </div>
        )}

        {/* METHOD 1: PHONE SMS AUTH */}
        {authMethod === 'phone' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Select Country &amp; Smartphone Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-400"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                          {c.flag} {c.code} ({c.name})
                        </option>
                      ))}
                    </select>

                    {/* Phone Number Input */}
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Mobile Number (e.g. 1234567890)"
                        className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    We'll send a real 6-digit SMS verification code directly to your smartphone.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white text-xs font-extrabold shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Real SMS Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send SMS Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* OTP Code Input Step */
              <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fadeIn">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Enter 6-Digit SMS Code</label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setErrorMsg('');
                      }}
                      className="text-[11px] text-purple-400 hover:underline font-semibold"
                    >
                      Change Phone Number
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="1 2 3 4 5 6"
                      className="w-full pl-9 pr-3 py-3 bg-black/40 border border-purple-500/50 rounded-xl text-center text-lg font-mono font-bold tracking-[0.5em] text-purple-300 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Verify Code &amp; Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* METHOD 2: EMAIL & PASSWORD AUTH */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                {emailMode === 'signup' ? 'Create New Account' : 'Sign In to Account'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmailMode(emailMode === 'signin' ? 'signup' : 'signin');
                  setErrorMsg('');
                }}
                className="text-[11px] font-bold text-purple-400 hover:underline"
              >
                {emailMode === 'signin' ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
              </button>
            </div>

            {emailMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Mido Gamez"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{emailMode === 'signup' ? 'Create Real Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* METHOD 3: GOOGLE OAUTH */}
        {authMethod === 'google' && (
          <div className="space-y-4 text-center py-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              Use your Google Account for fast, secure 1-click authentication powered by Firebase Auth.
            </p>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-black shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Footer Guest Options */}
        {onContinueAsGuest && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500">Want to test first?</span>
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 hover:underline"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Continue as Guest</span>
            </button>
          </div>
        )}

        {isModalView && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
          >
            Close Window
          </button>
        )}
      </div>
    </div>
  );
};
