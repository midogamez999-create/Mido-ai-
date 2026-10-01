import React from 'react';
import { UserAccount } from '../types';
import { RealAuthScreen } from './RealAuthScreen';
import { X } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (user: UserAccount) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <RealAuthScreen
          isModalView={true}
          onSuccessAuth={(user) => {
            onSelectAccount(user);
            onClose();
          }}
          onCloseModal={onClose}
        />
      </div>
    </div>
  );
};
