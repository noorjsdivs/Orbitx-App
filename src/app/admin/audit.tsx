import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Txt } from '@/components/ui/text';
import { AdminScreen } from '@/features/admin-ui';
import { useColors } from '@/hooks/use-theme';
import { useAdmin } from '@/store/admin';

export default function AdminAudit() {
  const c = useColors();
  const audit = useAdmin((s) => s.audit);
  return (
    <AdminScreen gap={0}>
      <Txt size={12} color={c.t3} style={{ paddingBottom: 8 }}>
        Immutable · retained 7 years · exported nightly
      </Txt>
      {audit.map((a, i) => (
        <Appear key={a.t + a.act} i={Math.min(i, 8)} dy={12}>
          <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.hair }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: a.me ? c.ac : c.ctl }} />
            <View style={{ flex: 1, gap: 4 }}>
              <Txt size={14} lh={1.4}>
                {a.act}
              </Txt>
              <Txt mono size={11} color={c.t3}>
                {a.t} · {a.who}
              </Txt>
            </View>
          </View>
        </Appear>
      ))}
    </AdminScreen>
  );
}
