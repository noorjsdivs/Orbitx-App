import { useRouter, type Href } from 'expo-router';

import { useSession } from '@/store/session';

export type TabName = 'home' | 'markets' | 'trade' | 'futures' | 'assets';

/**
 * Switch tabs from anywhere in the app, like the design's `tab()`. `navigate` unwinds the
 * stack to the existing tabs route, so pushed screens above it are popped.
 */
export function useTabNav() {
  const router = useRouter();
  return (name: TabName) => router.navigate(`/${name}`);
}

/** Clear the onboarding/auth flow history and land on a route (e.g. Home after sign-in). */
export function useResetTo() {
  const router = useRouter();
  return (href: Href) => {
    if (router.canDismiss()) router.dismissAll();
    router.replace(href);
  };
}

/**
 * Guest gate: in guest mode, actions that need an account open the sign-up sheet instead.
 * Usage: `onPress={guard('Sign up to deposit', () => router.push('/deposit'))}`
 */
export function useGuard() {
  const router = useRouter();
  const guest = useSession((s) => s.status === 'guest');
  return (title: string, fn: () => void) => () => {
    if (guest) router.push({ pathname: '/sheets/guest', params: { title } });
    else fn();
  };
}
