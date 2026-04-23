import { NextResponse } from "next/server";

export interface ApiPagination {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export function apiSuccess<T>(data: T, pagination?: ApiPagination) {
  const body: { data: T; pagination?: ApiPagination } = { data };
  if (pagination) body.pagination = pagination;
  return NextResponse.json(body, { status: 200 });
}

export function apiCreated<T>(data: T, message?: string) {
  const body: { data: T; message?: string } = { data };
  if (message) body.message = message;
  return NextResponse.json(body, { status: 201 });
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
