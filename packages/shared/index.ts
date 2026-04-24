// Types
export type { ApiResponse } from './types/api-response';
export type {
  CompositeTypes,
  Database,
  Json,
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './types/database';
export type { LoginMethod, UserProfile } from './types/user';

// Schemas
export { updateUserProfileSchema } from './schemas/user';
export type { UpdateUserProfileInput } from './schemas/user';

// Utils
export { maskPhoneNumber } from './utils/mask-phone-number';

// 占位导出 — 后续 Story 逐步填充
// export * from './api';
// export * from './constants';
