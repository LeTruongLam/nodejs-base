import { NextFunction, Request, RequestHandler, Response } from 'express'
export const wrapRequestHandler = (func: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await func(req, res, next)
  } catch (error) {
    next(error)
  }
}
