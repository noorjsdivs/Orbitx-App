import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { FlashPrice } from '@/components/motion/flash-price';
import { fadeOut, listItemEnter, rowLayout } from '@/components/motion/presets';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CoinGlyph, Skel, Tag } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { COINS } from '@/data/market';
import { useColors } from '@/hooks/use-theme';
import { compact, fmt, pct } from '@/lib/format';
import { useMarket } from '@/store/market';
import { tint } from '@/theme/color';

export type RowMode = 'spot' | 'fut' | 'new';

/** Name/Vol · Last price · 24h change row (60h), used on Home and Markets. */
export function MarketRow({ sym, mode = 'spot', onPress }: { sym: string; mode?: RowMode; onPress?: () => void }) {
  const c = useColors();
  const q = useMarket((s) => s.prices[sym]);
  const co = COINS[sym];
  const sub = mode === 'fut' ? `Funding ${(co.fr ?? 0) >= 0 ? '+' : ''}${(co.fr ?? 0).toFixed(4)}%` : mode === 'new' ? `${co.listed} · Vol ${compact(co.v)}` : (co.listed ?? `Vol ${compact(co.v)}`);
  return (
    <Press
      onPress={onPress}
      scale={1}
      pressedStyle={{ backgroundColor: c.s1 }}
      accessibilityLabel={`${sym} ${fmt(q.p, co.dp)} ${pct(q.c)}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 60, paddingHorizontal: 16 }}>
      <CoinGlyph sym={sym} />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Txt size={15} weight={600}>
            {sym}
            <Txt size={12} color={c.t3}>
              {mode === 'fut' ? 'USDT' : '/USDT'}
            </Txt>
          </Txt>
          {mode === 'fut' && <Tag label="Perp" size={10} color={c.t2} bg={c.s2} style={{ paddingHorizontal: 5, paddingVertical: 1 }} />}
        </View>
        <Txt size={12} color={c.t3} numberOfLines={1}>
          {sub}
        </Txt>
      </View>
      <View style={{ width: 104, alignItems: 'flex-end', gap: 3 }}>
        <FlashPrice value={q.p} dir={q.dir} size={15} weight={500}>
          {fmt(q.p, co.dp)}
        </FlashPrice>
        <Txt size={12} color={c.t3}>
          ${fmt(q.p, co.dp)}
        </Txt>
      </View>
      <View style={{ width: 76, height: 32, borderRadius: 8, backgroundColor: q.c >= 0 ? c.up : c.dn, alignItems: 'center', justifyContent: 'center' }}>
        <Txt size={13} weight={600} color="#FFFFFF">
          {pct(q.c)}
        </Txt>
      </View>
    </Press>
  );
}

/**
 * A market row that fades in (staggered by `index`) when the list appears and glides
 * to its new position when the sort order changes.
 */
export function AnimatedMarketRow({ index, ...props }: { index: number; sym: string; mode?: RowMode; onPress?: () => void }) {
  return (
    <Animated.View entering={listItemEnter(index)} layout={rowLayout}>
      <MarketRow {...props} />
    </Animated.View>
  );
}

export function MarketRowSkeleton() {
  return (
    <Animated.View exiting={fadeOut} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 60, paddingHorizontal: 16 }}>
      <Skel w={32} h={32} r={16} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skel w={84} h={12} />
        <Skel w={56} h={10} tone="hair" />
      </View>
      <Skel w={72} h={12} />
      <Skel w={76} h={32} r={8} />
    </Animated.View>
  );
}

/** Centered error state with a retry action. */
export function ErrorState({ title, body, onRetry, card = true, cta = 'Retry', primary }: { title: string; body: string; onRetry: () => void; card?: boolean; cta?: string; primary?: boolean }) {
  const c = useColors();
  return (
    <View
      style={[
        { alignItems: 'center', gap: 8, paddingVertical: 20, paddingHorizontal: 16, marginHorizontal: 16, marginVertical: 8 },
        card && { borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.s1 },
      ]}>
      <View style={{ width: card ? 36 : 44, height: card ? 36 : 44, borderRadius: 22, backgroundColor: tint(c.dn, 12), alignItems: 'center', justifyContent: 'center' }}>
        <Txt size={card ? 14 : 18} weight={700} color={c.dn}>
          !
        </Txt>
      </View>
      <Txt size={card ? 15 : 16} weight={600} align="center">
        {title}
      </Txt>
      <Txt size={13} lh={1.45} color={c.t2} align="center" style={{ maxWidth: 280 }}>
        {body}
      </Txt>
      <Button label={cta} variant={primary ? 'primary' : 'secondary'} h={44} size={14} style={{ marginTop: card ? 0 : 8, paddingHorizontal: primary ? 24 : 20 }} onPress={onRetry} />
    </View>
  );
}

/** Dashed empty state with optional CTA. */
export function EmptyState({ title, body, cta, onCta, icon, dashed = true }: { title: string; body?: string; cta?: string; onCta?: () => void; icon?: boolean; dashed?: boolean }) {
  const c = useColors();
  return (
    <View
      style={[
        { alignItems: 'center', gap: 8, paddingVertical: 20, paddingHorizontal: 16, marginHorizontal: 16, marginVertical: 8 },
        dashed && { borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s3 },
      ]}>
      {icon && (
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.s2, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="search" size={20} color={c.t3} />
        </View>
      )}
      <Txt size={15} weight={600} align="center">
        {title}
      </Txt>
      {body && (
        <Txt size={13} lh={1.45} color={c.t2} align="center" style={{ maxWidth: 280 }}>
          {body}
        </Txt>
      )}
      {cta && <Button label={cta} h={44} size={14} style={{ paddingHorizontal: 20, marginTop: 4 }} onPress={onCta} />}
    </View>
  );
}

/** Small section header row: title left, action right. */
export function SectionHead({ title, action, onAction, style }: { title: string; action?: React.ReactNode; onAction?: () => void; style?: object }) {
  const c = useColors();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 12, paddingHorizontal: 16 }, style]}>
      <Txt size={17} weight={600}>
        {title}
      </Txt>
      {typeof action === 'string' ? (
        <Press scale={1} onPress={onAction} style={{ height: 44, justifyContent: 'center', paddingHorizontal: 8, marginRight: -8 }}>
          <Txt size={13} color={c.t2}>
            {action}
          </Txt>
        </Press>
      ) : (
        action
      )}
    </View>
  );
}
