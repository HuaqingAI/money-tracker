import type { ReactElement } from 'react';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import TestRenderer, { act } from 'react-test-renderer';
import { expect, vi } from 'vitest';

import { UIProvider } from './provider';

type TextMatch = string | RegExp;

function matches(value: unknown, matcher: TextMatch) {
  const text = String(value ?? '');
  return typeof matcher === 'string' ? text === matcher : matcher.test(text);
}

function instanceText(instance: ReactTestInstance): string {
  return instance.children
    .map((child) => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
    .join('');
}

function findByPredicate(root: ReactTestInstance, predicate: (node: ReactTestInstance) => boolean) {
  return root.findAll(predicate)[0] ?? null;
}

function getByPredicate(root: ReactTestInstance, predicate: (node: ReactTestInstance) => boolean, message: string) {
  const node = findByPredicate(root, predicate);
  if (!node) throw new Error(message);
  return node;
}

export interface TestScreen {
  renderer: ReactTestRenderer;
  root: ReactTestInstance;
  getByText: (text: TextMatch) => ReactTestInstance;
  queryByText: (text: TextMatch) => ReactTestInstance | null;
  getByLabelText: (label: TextMatch) => ReactTestInstance;
  queryByLabelText: (label: TextMatch) => ReactTestInstance | null;
}

export function renderWithProvider(ui: ReactElement) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<UIProvider defaultTheme="light">{ui}</UIProvider>);
  });

  if (!renderer) throw new Error('Failed to render test component');

  const root = renderer.root;
  const screen: TestScreen = {
    renderer,
    root,
    getByText: (text) =>
      getByPredicate(root, (node) => matches(instanceText(node), text), `Unable to find text ${String(text)}`),
    queryByText: (text) => findByPredicate(root, (node) => matches(instanceText(node), text)),
    getByLabelText: (label) =>
      getByPredicate(
        root,
        (node) => matches(node.props.accessibilityLabel ?? node.props['aria-label'], label),
        `Unable to find label ${String(label)}`,
      ),
    queryByLabelText: (label) =>
      findByPredicate(root, (node) => matches(node.props.accessibilityLabel ?? node.props['aria-label'], label)),
  };

  return screen;
}

export const fireEvent = {
  press(node: ReactTestInstance) {
    act(() => {
      node.props.onPress?.({ nativeEvent: {} });
    });
  },
  changeText(node: ReactTestInstance, value: string) {
    act(() => {
      node.props.onChangeText?.(value);
    });
  },
};

export function getA11yState(node: ReactTestInstance) {
  const state = node.props.accessibilityState ?? {};
  return {
    checked: state.checked ?? node.props['aria-checked'],
    disabled: state.disabled ?? node.props['aria-disabled'],
    expanded: state.expanded ?? node.props['aria-expanded'],
    selected: state.selected ?? node.props['aria-selected'],
  };
}

export function getA11yValue(node: ReactTestInstance) {
  const value = node.props.accessibilityValue ?? {};
  return {
    max: value.max ?? node.props['aria-valuemax'],
    min: value.min ?? node.props['aria-valuemin'],
    now: value.now ?? node.props['aria-valuenow'],
    text: value.text ?? node.props['aria-valuetext'],
  };
}

export async function waitFor(assertion: () => void | Promise<void>, timeoutMs = 1000) {
  const startedAt = Date.now();
  let lastError: unknown;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  if (lastError) throw lastError;
  expect.fail('waitFor timed out');
}

export { vi };
export { act };
