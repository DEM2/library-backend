import { Request, Response } from 'express';
import { UserModel, userType } from '../models/userModel';
import argon2 from 'argon2';
import { BookModel } from '../models/bookModel';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {ReservationModel} from "../models/reservationModel";
import ReservationService from '../service/ReservationService';
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

async function createBook(req: Request, res: Response) {
    const { title, author, category , ISBN, publicationYear, publisher, availableCopies } = req.body

    try {
        const newBook = new BookModel({
            title: title,
            author: author,
            category : category ,
            ISBN: ISBN,
            publicationYear: publicationYear,
            publisher: publisher,
            availableCopies: availableCopies
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
        permission: user.permissions
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
        category: category ? { $in: Array.isArray(category) ? category : [category] } : undefined,
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

async function bookUpdate(req: Request, res: Response) {
    const ISBN = req.params;
    const data =  req.body;

    try {
        const updatedBook = await BookModel.findOneAndUpdate(
            { ISBN: ISBN }, 
             data,    
            { new: true }   
        );
        if (!updatedBook) {
             res.status(404).json({ message: 'Libro no encontrado' });
             return
        }
        res.status(200).json({
            message: 'Libro actualizado con éxito',
            book: updatedBook
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el libro', error });
    }
}

async  function  assignPermissions(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.params.userId.trim().replace(':', '');

        // Verifica que el `userId` sea válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'ID de usuario inválido' });
            return;
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const { permission } = req.body;

        // Valida que `permission` esté presente en la solicitud
        if (!permission) {
            res.status(400).json({ message: 'Permiso no especificado' });
            return;
        }

        // Busca el usuario
        const user = await UserModel.findById(userObjectId);
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        // Agrega el permiso solo si no existe ya en el arreglo
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

async  function reserveBook(req: Request, res: Response) {
    try {
      const { _id } =(req as any).user;
      const { bookId } = req.params;

      const reservation = await ReservationService.createReservation(_id, bookId);
      res.status(201).json({ message: 'Reserva creada exitosamente', reservation });
      return
    } catch (error) {
      res.status(400).json({ error: error });
      return
    }
  }

  async  function returnBook(req: Request, res: Response) {
    try {
      const { reservationId } = req.params;

      const reservation = await ReservationService.returnBook(reservationId);
      res.status(200).json({ message: 'Libro devuelto exitosamente', reservation });
      return
    } catch (error) {
      res.status(400).json({ error: error });
      return
    }
  }

  async function getUserReservationHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const reservations = await ReservationService.getUserReservationHistory(userId);
      res.status(200).json(reservations);
      return
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el historial de reservas del usuario' });
      return
    }
  }

  async function getBookReservationHistory(req: Request, res: Response) {
    try {
      const { bookId } = req.params;
      const reservations = await ReservationService.getBookReservationHistory(bookId);
      res.status(200).json(reservations);
      return
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el historial de reservas del libro' });
      return
    }
  }


export { createUser, createBook, Login, searchBook, userUpdate, bookUpdate,  assignPermissions, reserveBook, returnBook, getUserReservationHistory, getBookReservationHistory }