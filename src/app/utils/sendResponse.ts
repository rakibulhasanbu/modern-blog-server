import { Response } from "express";

interface TResData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

const sendRes = <T>(res: Response, data: TResData<T>) => {
  res.status(data?.statusCode).json({
    success: data?.success,
    statusCode: data?.statusCode,
    message: data?.message,
    data: data?.data,
  });
};

export default sendRes;
