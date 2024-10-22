import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

async function userAuthentication (request: Request,response: Response, next: NextFunction): Promise<void>{
    const auth = request.headers["authorization"];

    if (!auth){
        response.status(401).json({ message: "Token no proporcionado." }) ;
        return
    }
    const token = auth.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (request as any).user = decoded;

        next();
    } catch (error) {
        response.status(403).json({ message: "Token inválido o expirado." });
    }
} 

export { userAuthentication };
