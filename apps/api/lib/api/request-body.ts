import { type ApiResponse, AUTH_ERROR_CODES } from '@money-tracker/shared';
import { NextResponse } from 'next/server';
import type { z } from 'zod';

function invalidInputResponse(message: string): Response {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      error: {
        code: AUTH_ERROR_CODES.invalidInput,
        message,
      },
    },
    { status: 400 },
  );
}

export async function parseJsonRequest<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<
  | {
      success: true;
      data: z.infer<TSchema>;
    }
  | {
      success: false;
      response: Response;
    }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: invalidInputResponse('请求体必须是合法 JSON'),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      response: invalidInputResponse(parsed.error.issues[0]?.message ?? '请求参数不合法'),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}
