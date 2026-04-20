/**
 * Tamagui 类型扩展
 *
 * 通过 module augmentation 让 `styled()` 与 `<Text />` 等组件的
 * `$<token>` 属性获得正确类型推断。
 */
import type { Conf } from './tamagui.config';

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends Conf {}
}
