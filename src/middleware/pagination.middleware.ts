import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

type paginate = Record<'next' | 'previous', { page: number; limit: number }>;
type result<T> = paginate & Record<'results', T[]>;

// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     console.log('Request...');
//     next();
//   }
// }

// @Injectable()
// export class PaginationMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     const { page, limit } = req.query;
//     if (limit && page) {
//       const limitToNumber = +limit;
//       const pageToNumber = +page;
//       const startIndex = (pageToNumber - 1) * limitToNumber;
//       const endIndex = pageToNumber * limitToNumber;
//       const result = {} as result<T>;
//       if (endIndex < model.length) {
//         result.next = {
//           page: pageToNumber + 1,
//           limit: limitToNumber,
//         };
//       }
//       if (startIndex > 0) {
//         result.previous = {
//           page: pageToNumber - 1,
//           limit: limitToNumber,
//         };
//       }
//       result.results = model.slice(startIndex, endIndex);
//       console.log(result);
//       req.body = result;
//     }
//     next();
//   }
// }

export function pagination<T>(model: T[], limit: number = 5, page: number = 1) {
  return (req: Request, res: Response, next: NextFunction) => {
    // console.log(req);
    // const { page, limit } = req.query;
    // console.log(req.query);
    // const limitToNumber = +limit || 5;
    // const pageToNumber = +page || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = {} as result<T>;
    if (endIndex < model.length) {
      result.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      result.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    result.results = model.slice(startIndex, endIndex);
    req.body = result;
    next();
  };
}
