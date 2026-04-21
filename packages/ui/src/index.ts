/**
 * @money-tracker/ui 统一导出桶文件（唯一对外入口）
 *
 * 禁止通过子路径（如 '@money-tracker/ui/src/button'）直接导入；
 * 所有新增组件必须经此处 re-export。
 */

export type { Conf } from '../tamagui.config';
export { config, shadows } from '../tamagui.config';
export { Button } from './button';
export type { UIProviderProps } from './provider';
export { UIProvider } from './provider';
export { Text } from './text';
export { TextInput } from './text-input';
