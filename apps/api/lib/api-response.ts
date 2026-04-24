import type { ApiResponse } from '@money-tracker/shared';
import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200): Response {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
): Response {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}
