import { Request, Response } from 'express';
import { UserModel, userType } from '../models/userModel';
import argon2 from 'argon2';
import { BookModel } from '../models/bookModel';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";



async function createUser(req: Request, res: Response): Promise<void> {
    const { name, lastName, email, password, role } = req.body

    try {

        const uExist = await UserModel.findOne({ email })
        if (uExist) {
            res.status(400).json({ message: 'El usuario ya existe' });
            return;
        }
        const pepper = process.env.PEPPER || "";
        const hashedPassword = await argon2.hash(password + pepper);
        const date = new Date();

        const newUser = new UserModel(
            {
                name: name,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                register_date: new Date(date.getDay(), date.getMonth(), date.getFullYear()),
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

async function createBook(req: Request, res: Response) {
    const { title, author, category , ISBN, publicationYear, publisher, availability } = req.body
    const user = (req as any).user;
    if (user.role != 'Administrador') {
        res.status(403).json({ message: 'No tienes permisos para crear un libro' })
        return
    }

    try {
        const newBook = new BookModel({
            title: title,
            author: author,
            category : category ,
            ISBN: ISBN,
            publicationYear: publicationYear,
            publisher: publisher,
            availability: availability
        })

        await newBook.save()

        res.status(201).json({
            message: 'Book saved successfully',
            book: { id: newBook.id, title: newBook.title}
        })
    } catch (error) { res.status(500).json({ message: 'Error al registrar el Libro', error }); }

}

async function Login (req: Request, res: Response) : Promise<void> {
    const {email, password} = req.body

    try{
        const user = await UserModel.findOne({ email})
        const pepper = process.env.PEPPER || ""

    if(!user || !await argon2.verify(user.password,password + pepper)) {
        res.status(401).json({ message: 'Credenciales Invalidas' })
        return
    }
       

    const token = jwt.sign({
        userId: user._id,
        role: user.role
    }, process.env.JWT_SECRET as string, {expiresIn:'1h'})

    res.json({token})
    } catch(error){
        res.status(500).json({message:'Error en el proceso de Autenticacion', error})
    }
    
}

async function searchBook(req: Request, res: Response) {
    const {ISBN, author, category, publicationYear, title, publisher, availability} = req.query

    if (ISBN) {
        const book = await BookModel.findOne({ ISBN });
        if (!book) {
            res.status(404).json({ message: "No se encontró el libro con ese ISBN." });
            return 
        }
        res.json({ book });
        return;
    }

    const filterParams = {
        category: category ? { $in: [category as string] } : undefined,
        publicationYear: publicationYear ? Number(publicationYear) : undefined,
        publisher: publisher ? publisher as string : undefined,
        author: author ? author as string : undefined,
        title: title ? { $regex: new RegExp(title as string, "i") } : undefined,
        availability: availability ? availability as string : undefined,
    };
    
    const filter = Object.fromEntries(Object.entries(filterParams).filter(([_, v]) => v !== undefined));    

    try {
        const books = await BookModel.find(filter);
        if (books.length === 0) {
            res.status(404).json({ message: "No se encontraron libros con esos criterios." });
            return 
        }
        res.status(200).json({ books });
        return
    } catch (error) {
        res.status(500).json({ error});
        return
    }

}

export { createUser, createBook, Login, searchBook }