import { useRouter } from 'expo-router';
import { useState } from 'react';

import { haptic } from '@/hooks/use-haptics';
import { useResetTo } from '@/lib/nav';
import { useMarket } from '@/store/market';
import { useSession, type SessionStatus } from '@/store/session';
import { toast } from '@/store/toast';

/** Land in the trader app (or admin console) with a clean history. */
export function useEnterApp() {
  const resetTo = useResetTo();
  return (status: Exclude<SessionStatus, 'none'>, msg?: string) => {
    useSession.getState().set({ status, onboarded: true });
    useMarket.getState().boot();
    resetTo(status === 'admin' ? '/admin' : '/home');
    if (msg) setTimeout(() => toast(msg), 350);
  };
}

/** Simulated Apple / Google sign-in (1.1s), as in the prototype. */
export function useOAuth(mode: 'signin' | 'register') {
  const router = useRouter();
  const enter = useEnterApp();
  const [busy, setBusy] = useState<null | 'google' | 'apple'>(null);
  const start = (p: 'google' | 'apple') => {
    if (busy) return;
    haptic.impact();
    setBusy(p);
    setTimeout(() => {
      setBusy(null);
      const nm = p === 'google' ? 'Google' : 'Apple';
      if (mode === 'register') {
        useSession.getState().set({ status: 'none', onboarded: true });
        router.push('/setup/profile');
        toast(nm + ' account linked');
      } else {
        enter('user', 'Signed in with ' + nm);
      }
    }, 1100);
  };
  return { busy, start };
}

export function useEnterGuest() {
  const enter = useEnterApp();
  return () => enter('guest', 'Guest mode · live prices and markets');
}

export const isEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim());

/** Password score 0–4: length ≥ 8, uppercase, digit, symbol. */
export function passwordScore(pw: string): number {
  return +(pw.length >= 8) + +/[A-Z]/.test(pw) + +/\d/.test(pw) + +/[^A-Za-z0-9]/.test(pw);
}
