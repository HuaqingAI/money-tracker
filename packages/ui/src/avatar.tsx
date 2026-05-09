import type { ReactNode } from 'react';
import { Avatar as TamaguiAvatar, Spinner, Text as TamaguiText, XStack } from 'tamagui';

import { a11yProps, dsMetrics, type DsSize, getInitials, getStableToneFromName, sizeValues, toneColorTokens } from './component-utils';

export interface AvatarProps {
  name?: string;
  imageUrl?: string;
  initials?: string;
  size?: DsSize;
  editable?: boolean;
  loading?: boolean;
  placeholderIcon?: ReactNode;
  accessibilityLabel?: string;
  onEditPress?: () => void;
}

export function Avatar({
  name,
  imageUrl,
  initials,
  size = 'md',
  editable = false,
  loading = false,
  placeholderIcon,
  accessibilityLabel,
  onEditPress,
}: AvatarProps) {
  const dimension = sizeValues[size];
  const label = accessibilityLabel ?? `${name ?? initials ?? '用户'}的头像`;
  const fallbackText = initials ?? getInitials(name);
  const fallbackTone = toneColorTokens[getStableToneFromName(name ?? initials)];

  return (
    <XStack position="relative" width={dimension} height={dimension} {...a11yProps({ role: 'image', label })}>
      <TamaguiAvatar circular size={dimension} borderWidth={1} borderColor="$neutral200">
        {imageUrl ? <TamaguiAvatar.Image src={imageUrl} {...a11yProps({ label })} /> : null}
        <TamaguiAvatar.Fallback
          backgroundColor={fallbackTone}
          alignItems="center"
          justifyContent="center"
        >
          {placeholderIcon ?? (
            <TamaguiText color="$surfacePrimary" fontSize={size === 'sm' ? '$3' : '$6'} fontWeight="700">
              {fallbackText}
            </TamaguiText>
          )}
        </TamaguiAvatar.Fallback>
      </TamaguiAvatar>
      {loading ? (
        <XStack
          position="absolute"
          inset={0}
          borderRadius="$full"
          backgroundColor="$backdrop"
          alignItems="center"
          justifyContent="center"
          {...a11yProps({ label: '头像上传中', busy: true })}
        >
          <Spinner color="$surfacePrimary" size="small" />
        </XStack>
      ) : null}
      {editable ? (
        <XStack
          position="absolute"
          right={0}
          bottom={0}
          width={dsMetrics.avatarEditButton}
          height={dsMetrics.avatarEditButton}
          borderRadius="$full"
          backgroundColor="$neutral800"
          borderWidth={2}
          borderColor="$surfacePrimary"
          alignItems="center"
          justifyContent="center"
          {...a11yProps({ role: 'button', label: '编辑头像' })}
          onPress={onEditPress}
        >
          <TamaguiText color="$surfacePrimary" fontSize="$1" fontWeight="700">
            +
          </TamaguiText>
        </XStack>
      ) : null}
    </XStack>
  );
}
