import { create } from 'zustand';

type ToastState = { msg: string; visible: boolean; seq: number };

export const useToastStore = create<ToastState>()(() => ({ msg: '', visible: false, seq: 0 }));

let timer: ReturnType<typeof setTimeout> | undefined;

/** Show a short confirmation toast (2.4s), like the design's `toastMsg`. */
export function toast(msg: string) {
  clearTimeout(timer);
  useToastStore.setState((s) => ({ msg, visible: true, seq: s.seq + 1 }));
  timer = setTimeout(() => useToastStore.setState({ visible: false }), 2400);
}
