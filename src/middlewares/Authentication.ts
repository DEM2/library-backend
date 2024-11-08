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

function permissionRequired(permission: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !user.permission || !user.permission.includes(permission)) {
            res.status(403).json({ message: 'Acceso denegado: permiso insuficiente' });
            return;
        }

        next();
    };
}


async function userPermission(request: Request, response: Response, next: NextFunction) {
    const user = (request as any).user;
    const { id } = request.params;
    console.log(user)

    if (user.userId === id){
        next();  
        return;
    }

    return permissionRequired('user_Update')(request, response, next);
}

export { userAuthentication, permissionRequired, userPermission };
