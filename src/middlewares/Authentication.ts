
import {Request, Response, NextFunction} from 'express';

const userAuthentication = (request: Request, response: Response, next: NextFunction) => {
    const token = request.headers['authorization']?.split(' ')[1];

    next();
}
