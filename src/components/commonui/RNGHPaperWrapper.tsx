import { Pressable } from 'react-native-gesture-handler';
import { IconButton as PaperIconButton } from 'react-native-paper';
import { Props as PaperIconButtonProps } from 'react-native-paper/lib/typescript/components/IconButton/IconButton';

// wraps rnpaper's icon button to use RNGH's pressable. solves button not working inside
// of a RNGH pressable.

interface IconButtonProps extends PaperIconButtonProps {
  hideRipple?: boolean;
}

export const IconButton = (p: IconButtonProps) => {
  return (
    // TODO: write a wrapper to translate gesture event to native event
    // @ts-expect-error
    <Pressable onPress={p.disabled ? undefined : p.onPress}>
      <PaperIconButton
        {...p}
        onPress={p.hideRipple || p.onPress === undefined ? undefined : () => {}}
      />
    </Pressable>
  );
};
