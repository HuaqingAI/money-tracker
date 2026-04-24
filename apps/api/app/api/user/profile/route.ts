import { updateUserProfileSchema } from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../lib/api-response';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../lib/middleware/require-authenticated-user';
import { getUserProfile, updateUserProfile } from '../../../../lib/services/user-service';

function toErrorResponse(error: unknown): Response {
  if (error instanceof AuthenticatedUserError) {
    return errorResponse(error.code, error.message, error.status);
  }

  if (error instanceof Error) {
    return errorResponse('USER_PROFILE_FAILED', error.message, 500);
  }

  return errorResponse('USER_PROFILE_FAILED', 'Failed to handle user profile.', 500);
}

export function GET(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      const profile = await getUserProfile(user);
      return successResponse(profile);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export function PUT(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    try {
      const { user } = await requireAuthenticatedUser(request);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return errorResponse('INVALID_JSON', 'Request body must be valid JSON.', 400);
      }

      const parsed = updateUserProfileSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(
          'INVALID_PROFILE_INPUT',
          parsed.error.issues[0]?.message ?? 'Invalid profile input.',
          400,
        );
      }

      const profile = await updateUserProfile(user, parsed.data);
      return successResponse(profile);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
