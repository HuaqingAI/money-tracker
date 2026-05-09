import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button as TamaguiButton, Text as TamaguiText, XStack, YStack } from 'tamagui';

import { shadows } from '../tamagui.config';
import { a11yProps, dsMetrics } from './component-utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
  action?: ToastAction;
}

export interface ToastContextValue {
  showToast: (message: Omit<ToastMessage, 'id'> & { id?: string }) => void;
  hideToast: (id?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastTone: Record<ToastVariant, string> = {
  success: '$success',
  error: '$error',
  warning: '$warning',
  info: '$info',
};

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [queue, setQueue] = useState<ToastMessage[]>([]);
  const current = queue[0];
  const timerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const hideToast = useCallback((id?: string) => {
    setQueue((items) => (id ? items.filter((item) => item.id !== id) : items.slice(1)));
  }, []);

  const showToast = useCallback(
    (message: Omit<ToastMessage, 'id'> & { id?: string }) => {
      const id = message.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const next = { ...message, id };
      setQueue((items) => [...items, next]);
    },
    [],
  );

  useEffect(() => {
    if (timerRef.current) {
      globalThis.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!current) return undefined;

    const duration = current.durationMs ?? (current.variant === 'error' ? 3000 : 2200);
    timerRef.current = globalThis.setTimeout(() => hideToast(current.id), duration);

    return () => {
      if (timerRef.current) {
        globalThis.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [current, hideToast]);

  const value = useMemo(() => ({ showToast, hideToast }), [hideToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {current ? <ToastView message={current} onDismiss={() => hideToast(current.id)} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used within UIProvider/ToastProvider');
  }
  return value;
}

export interface ToastProps extends ToastMessage {
  onDismiss?: () => void;
}

export function Toast({ onDismiss, ...message }: ToastProps) {
  return <ToastView message={message} onDismiss={onDismiss} />;
}

function ToastView({ message, onDismiss }: { message: ToastMessage | Omit<ToastMessage, 'id'>; onDismiss?: () => void }) {
  const variant = message.variant ?? 'info';
  return (
    <YStack
      position="absolute"
      top="$4"
      left="$4"
      right="$4"
      padding="$3"
      borderRadius="$lg"
      backgroundColor="$surfacePrimary"
      borderWidth={1}
      borderColor="$neutral100"
      gap="$2"
      zIndex={dsMetrics.toastZIndex}
      {...a11yProps({ role: 'status', label: message.title, liveRegion: 'polite' })}
      {...shadows.md}
    >
      <XStack gap="$2" alignItems="center">
        <YStack width={dsMetrics.toastToneDot} height={dsMetrics.toastToneDot} borderRadius="$full" backgroundColor={toastTone[variant]} />
        <TamaguiText flex={1} color="$neutral800" fontSize="$3" fontWeight="600">
          {message.title}
        </TamaguiText>
        <XStack {...a11yProps({ role: 'button', label: '关闭提示' })} onPress={onDismiss}>
          <TamaguiText color="$neutral500" fontSize="$4">
            ×
          </TamaguiText>
        </XStack>
      </XStack>
      {message.description ? (
        <TamaguiText color="$neutral500" fontSize="$2">
          {message.description}
        </TamaguiText>
      ) : null}
      {message.action ? (
        <TamaguiButton
          size="$2"
          alignSelf="flex-start"
          {...a11yProps({ label: message.action.label })}
          onPress={message.action.onPress}
        >
          {message.action.label}
        </TamaguiButton>
      ) : null}
    </YStack>
  );
}
