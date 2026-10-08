import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEVICES, type Device, type IdDocKind } from '@/data/fixtures';

import { persistStorage } from './storage';

export type SessionStatus = 'none' | 'user' | 'guest' | 'admin';
export type AuthTab = 'email' | 'phone';

type SessionState = {
  status: SessionStatus;
  onboarded: boolean;
  // identity
  authTab: AuthTab;
  email: string;
  phone: string;
  dial: string;
  name: string;
  country: string;
  curMode: 'local' | 'usd';
  // security
  kycDone: boolean;
  tfaOn: boolean;
  antiPh: string;
  wlOn: boolean;
  devices: Device[];
  idType: IdDocKind;
  /** OTP step context (not persisted) */
  otpMode: 'verify' | '2fa';
  pendingAdmin: boolean;
  set: (p: Partial<SessionState>) => void;
  signOut: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      status: 'none',
      onboarded: false,
      authTab: 'email',
      email: '',
      phone: '',
      dial: 'NG',
      name: '',
      country: 'Nigeria',
      curMode: 'local',
      kycDone: false,
      tfaOn: true,
      antiPh: '',
      wlOn: false,
      devices: DEVICES,
      idType: 'national',
      otpMode: 'verify',
      pendingAdmin: false,
      set: (p) => set(p),
      signOut: () => set({ status: 'none', pendingAdmin: false }),
    }),
    {
      name: 'orbitx.session',
      storage: persistStorage,
      partialize: ({ otpMode: _o, pendingAdmin: _p, set: _s, signOut: _x, ...rest }) => rest,
    },
  ),
);

/** First name shown in greetings. */
export function displayName(name: string, guest: boolean): string {
  if (guest) return 'Guest';
  return name.trim().split(/\s+/)[0] || 'Christina';
}

export function fullName(name: string): string {
  return name.trim() || 'Christina John';
}
