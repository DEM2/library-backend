import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import argon2 from 'argon2';


async function createUser(req: Request, res: Response): Promise<void> {
    const { name, lastName, email, password, role } = req.body

    try {

        const uExist = await UserModel.findOne({ email })
        if (uExist) {
            res.status(400).json({ message: 'El usuario ya existe' });
            return;
        }
        const pepper = process.env.PEPPER || ""; 
        const hashedPassword = await argon2.hash(password+pepper);
        const date = new Date();

        const newUser = new UserModel(
            {
                name: name,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                register_date: new Date(date.getDay(),date.getMonth(), date.getFullYear()),
                role: role
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

async function createBook (req: Request, res: Response ) {
    
}


export{createUser, createBook}