import { useRouter } from 'expo-router';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { RowsPanel } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { computeWithdraw } from '@/features/withdraw';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';
import { useWallet } from '@/store/wallet';

export default function WithdrawConfirm() {
  const c = useColors();
  const router = useRouter();
  const w = useDrafts((s) => s.withdraw);
  const patch = useDrafts((s) => s.patch);
  const usdt = useWallet((s) => s.bal.USDT ?? 0);
  const credit = useWallet((s) => s.credit);
  const tfaOn = useSession((s) => s.tfaOn);
  const t = computeWithdraw(w, usdt, tfaOn);
  const codeOk = w.code.length === 6;

  return (
    <SheetBody title="Confirm withdrawal" closable={false}>
      <RowsPanel
        rows={[
          { k: 'To', v: w.addr ? `${w.addr.slice(0, 8)}…${w.addr.slice(-6)}` : '--', mono: true },
          { k: 'Network', v: `${t.net.id} · ${t.net.name}` },
          { k: 'Amount', v: `${fmt(t.amt, 2)} USDT` },
          { k: 'Network fee', v: t.net.fee },
          { k: 'You receive', v: `${fmt(t.receive, 2)} USDT` },
        ]}
      />
      <Txt size={13} weight={500} color={c.t2}>
        Authenticator code
      </Txt>
      <Field
        value={w.code}
        onChangeText={(v) => patch('withdraw', { code: v.replace(/\D/g, '').slice(0, 6) })}
        placeholder="6-digit code"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={6}
        size={20}
        inputStyle={{ letterSpacing: w.code ? 6 : 0 }}
      />
      <Button
        label="Confirm withdrawal"
        dim={!codeOk}
        onPress={() => {
          if (!codeOk) {
            haptic.warn();
            return toast('Enter your 6-digit 2FA code');
          }
          credit('USDT', -t.amt);
          patch('withdraw', { amt: '', addr: '', code: '' });
          haptic.success();
          router.back();
          toast('Withdrawal submitted · confirmation email sent');
        }}
      />
    </SheetBody>
  );
}
