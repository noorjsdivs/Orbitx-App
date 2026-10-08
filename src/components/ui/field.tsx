import { useState } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';

import { useColors } from '@/hooks/use-theme';
import { tint } from '@/theme/color';
import { fontFamily } from '@/theme/fonts';

import { Press } from './press';
import { Txt } from './text';

type FieldProps = TextInputProps & {
  h?: number;
  size?: number;
  mono?: boolean;
  /** Trailing inline action, e.g. MAX / Paste / Show. */
  action?: { label: string; onPress: () => void; plain?: boolean };
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

/** Outlined input with the design's accent focus ring. */
export function Field({ h = 48, size = 15, mono, action, containerStyle, inputStyle, onFocus, onBlur, ...rest }: FieldProps) {
  const c = useColors();
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ justifyContent: 'center' }, containerStyle]}>
      <TextInput
        placeholderTextColor={c.placeholder}
        selectionColor={c.ac}
        keyboardAppearance="default"
        allowFontScaling={false}
        {...rest}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
        style={[
          {
            height: h,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: focus ? c.ac : c.s4,
            boxShadow: focus ? `0 0 0 3px ${tint(c.ac, 22)}` : undefined,
            color: c.t1,
            paddingHorizontal: 14,
            paddingRight: action ? 76 : 14,
            fontSize: size,
            fontFamily: fontFamily(400, mono),
          },
          inputStyle,
        ]}
      />
      {action && (
        <Press
          onPress={action.onPress}
          scale={0.95}
          style={{
            position: 'absolute',
            right: 5,
            height: h - 10,
            paddingHorizontal: action.plain ? 12 : 10,
            borderRadius: 8,
            backgroundColor: action.plain ? 'transparent' : c.s2,
            justifyContent: 'center',
          }}>
          <Txt size={action.plain ? 13 : 12} weight={action.plain ? 500 : 600} color={action.plain ? c.t2 : c.t1}>
            {action.label}
          </Txt>
        </Press>
      )}
    </View>
  );
}

/** Label above a field (13px t2). */
export function FieldLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Txt size={13} weight={500} color={c.t2}>
        {children}
      </Txt>
      {right}
    </View>
  );
}
