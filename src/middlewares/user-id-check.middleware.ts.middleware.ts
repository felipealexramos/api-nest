import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// Apenas exemplo, mudar depois
@Injectable()
export class UserIdCheckMiddlewareTsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;

    console.log('UserIdCheckMiddlewareTsMiddleware antes', id);
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Não vai funcionar, pois o id é um string
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid User ID' });
    }
    console.log('UserIdCheckMiddlewareTsMiddleware depois', id);
    next();
  }
}
