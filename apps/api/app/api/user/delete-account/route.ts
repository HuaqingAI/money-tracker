import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../lib/api-response';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../lib/middleware/require-authenticated-user';
import { deleteUserAccount } from '../../../../lib/services/user-service';

function toErrorResponse(error: unknown): Response {
  if (error instanceof AuthenticatedUserError) {
    return errorResponse(error.code, error.message, error.status);
  }

  if (error instanceof Error) {
    return errorResponse('DELETE_ACCOUNT_FAILED', error.message, 500);
  }

  return errorResponse('DELETE_ACCOUNT_FAILED', 'Failed to delete account.', 500);
}

export function DELETE(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      await deleteUserAccount(user);

      return successResponse({
        deleted: true,
      });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
