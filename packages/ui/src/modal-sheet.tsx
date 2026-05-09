import type { ReactNode } from 'react';
import { AlertDialog, Button as TamaguiButton, Sheet, Text as TamaguiText, XStack, YStack } from 'tamagui';

import { a11yProps, dsMetrics } from './component-utils';

export interface ModalSheetAction {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
}

export interface ModalSheetProps {
  open: boolean;
  variant?: 'alert' | 'sheet' | 'picker';
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  snapPoints?: Array<number | string>;
  dismissOnBackdropPress?: boolean;
  confirmAction?: ModalSheetAction;
  cancelAction?: ModalSheetAction;
  accessibilityLabel?: string;
  testMode?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ModalSheet({
  open,
  variant = 'sheet',
  title,
  description,
  children,
  snapPoints,
  dismissOnBackdropPress = true,
  confirmAction,
  cancelAction,
  accessibilityLabel,
  testMode = false,
  onOpenChange,
}: ModalSheetProps) {
  if (testMode && open) {
    return (
      <YStack
        padding="$4"
        borderRadius="$lg"
        backgroundColor="$surfacePrimary"
        {...a11yProps({
          role: variant === 'alert' ? 'alertdialog' : 'dialog',
          label: accessibilityLabel ?? String(title ?? '浮层'),
          modal: true,
        })}
      >
        {title ? (
          <TamaguiText color="$neutral800" fontSize="$7" fontWeight="600">
            {title}
          </TamaguiText>
        ) : null}
        {description ? (
          <TamaguiText color="$neutral500" fontSize="$3">
            {description}
          </TamaguiText>
        ) : null}
        {children}
      </YStack>
    );
  }

  if (variant === 'alert') {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay backgroundColor="$backdrop" />
          <AlertDialog.Content
            width={dsMetrics.modalAlertWidth}
            padding="$6"
            borderRadius="$xl"
            backgroundColor="$surfacePrimary"
            {...a11yProps({ role: 'alertdialog', label: accessibilityLabel ?? String(title ?? '确认对话框'), modal: true })}
          >
            {title ? (
              <AlertDialog.Title color="$neutral800" fontSize="$7" fontWeight="600">
                {title}
              </AlertDialog.Title>
            ) : null}
            {description ? (
              <AlertDialog.Description color="$neutral500" fontSize="$3" marginTop="$2">
                {description}
              </AlertDialog.Description>
            ) : null}
            {children}
            <XStack gap="$3" justifyContent="flex-end" marginTop="$5">
              {cancelAction ? (
                <AlertDialog.Cancel asChild>
                  <TamaguiButton onPress={cancelAction.onPress}>{cancelAction.label}</TamaguiButton>
                </AlertDialog.Cancel>
              ) : null}
              {confirmAction ? (
                <AlertDialog.Action asChild>
                  <TamaguiButton
                    backgroundColor={confirmAction.destructive ? '$error' : '$brand500'}
                    onPress={confirmAction.onPress}
                  >
                    {confirmAction.label}
                  </TamaguiButton>
                </AlertDialog.Action>
              ) : null}
            </XStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    );
  }

  const picker = variant === 'picker';
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints ?? [picker ? 60 : 80]}
      dismissOnOverlayPress={dismissOnBackdropPress}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay backgroundColor="$backdrop" />
      <Sheet.Frame
        padding="$4"
        borderTopLeftRadius="$xl"
        borderTopRightRadius="$xl"
        backgroundColor="$surfacePrimary"
        {...a11yProps({ role: 'dialog', label: accessibilityLabel ?? String(title ?? '底部面板'), modal: true })}
      >
        <Sheet.Handle backgroundColor="$neutral200" />
        {title ? (
          <TamaguiText color="$neutral800" fontSize="$7" fontWeight="600" marginTop="$3">
            {title}
          </TamaguiText>
        ) : null}
        {description ? (
          <TamaguiText color="$neutral500" fontSize="$3" marginTop="$2">
            {description}
          </TamaguiText>
        ) : null}
        <YStack marginTop="$4">{children}</YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
