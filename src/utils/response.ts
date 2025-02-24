import { Response } from "express";

export interface IResponse<TData> {
  message: string;
  data: TData;
}

export function generateResponse<TData>(
  res: Response,
  data: TData,
  message: string,
  code: number,
) {
  // Generate data
  const response: IResponse<TData> = {
    message,
    data,
  };

  return res.status(code).json(response);
}

export function generateSuccessResponse<TData>(
  res: Response,
  data: TData,
  code?: number,
  message?: string,
) {
  // Generate default properties
  message ??= "OK";

  code ??= 200;

  return generateResponse(res, data, message, code);
}

export function generateErrorResponse<TData>(
  res: Response,
  data: TData,
  code?: number,
  message?: string,
) {
  // Generate default properties
  message ??= "Something went wrong";

  code ??= 400;

  return generateResponse(res, data, message, code);
}
