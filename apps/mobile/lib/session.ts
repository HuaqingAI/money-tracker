import { useAuthStore } from '../stores/auth-store';
import { getQueryClient } from './query-client';

export async function clearClientSession(): Promise<void> {
  getQueryClient().clear();
  useAuthStore.getState().clearSession();
  await useAuthStore.persist.clearStorage();
}
