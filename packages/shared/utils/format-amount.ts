/**
 * 将分为单位的金额格式化为人民币显示格式
 * @param cents 金额（分）
 * @returns 格式化后的金额字符串，如 "¥150.00"
 */
export function formatAmountCents(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}
