import { Request, Response } from 'express';
import { UserModel} from '../models/userModel';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


async function createUser(req: Request, res: Response): Promise<void> {
    const { name, lastName, email, password } = req.body

    try {

        const uExist = await UserModel.findOne({ email })
        if (uExist) {
            res.status(400).json({ message: 'El usuario ya existe' });
            return;
        }
        const pepper = process.env.PEPPER || "";
        const hashedPassword = await argon2.hash(password + pepper);


        const newUser = new UserModel(
            {
                name: name,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                register_date: new Date().toISOString().split('T')[0],
                permissions: []
            }
        )

        await newUser.save()

        res.status(201).json({
            message: 'Usuario creado con éxito',
            user: { id: newUser._id, username: newUser.name, email: newUser.email }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
}

async function Login (req: Request, res: Response) : Promise<void> {
    const {email, password} = req.body

    try{
        const user = await UserModel.findOne({ email})
        const pepper = process.env.PEPPER || ""
    
    if (!user?.isActive) {
            res.status(403).json({ message: "Su cuenta está deshabilitada." });
            return;
        }
    if(!user || !await argon2.verify(user.password,password + pepper)) {
        res.status(401).json({ message: 'Credenciales Invalidas' })
        return
    }
       

    const token = jwt.sign({
        userId: user._id,
        permission: user.permissions
    }, process.env.JWT_SECRET as string, {expiresIn:'1h'})

    res.json({token})
    } catch(error){
        res.status(500).json({message:'Error en el proceso de Autenticacion', error})
    }
    
}

async function userUpdate(req: Request, res: Response) {
    const { id } = req.params;
    const Data = req.body;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(id, Data, { new: true });
        if (!updatedUser) {          
           res.status(404).json({ message: 'Usuario no encontrado' });
           return;
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
}

async  function  assignPermissions(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.params.userId.trim().replace(':', '');

        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'ID de usuario inválido' });
            return;
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const { permission } = req.body;

        
        if (!permission) {
            res.status(400).json({ message: 'Permiso no especificado' });
            return;
        }

        
        const user = await UserModel.findById(userObjectId);
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        
        if (!user.permissions.includes(permission)) {
            user.permissions.push(permission);
            await user.save();

            res.status(200).json({
                message: 'Permiso asignado exitosamente',
                user: {
                    id: user._id,
                    permissions: user.permissions
                }
            });
        } else {
            res.status(200).json({
                message: 'El permiso ya está asignado',
                user: {
                    id: user._id,
                    permissions: user.permissions
                }
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al asignar permisos', error });
    }
}

async function DeleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    
    try {

      const user = await UserModel.findByIdAndUpdate(userId, { isActive: false }, { new: true });
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' })
        return 
      };
  
      res.status(200).json({ message: 'Usuario inhabilitado correctamente', user });
    } catch (error) {
      res.status(500).json({ message: 'Error al inhabilitar el usuario', error });
    }
  }

export {createUser, userUpdate, Login, assignPermissions, DeleteUser}