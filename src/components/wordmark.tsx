import { Txt } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';

/** ORBIT<span accent>X</span> */
export function Wordmark({ size = 19 }: { size?: number }) {
  const c = useColors();
  return (
    <Txt size={size} weight={700} ls={-0.03}>
      ORBIT<Txt size={size} weight={700} ls={-0.03} color={c.acT}>X</Txt>
    </Txt>
  );
}
