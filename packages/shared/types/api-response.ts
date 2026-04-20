/**
 * 统一 API 响应类型
 *
 * 成功: { success: true, data: T }
 * 失败: { success: false, error: { code: string, message: string } }
 */
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
