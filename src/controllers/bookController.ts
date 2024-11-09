import { Request, Response } from 'express';
import {BookModel} from '../models/bookModel';


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

async function searchBook(req: Request, res: Response) {
    const {id, author, category, publicationYear, title, publisher, ISBN} = req.query

    if (id) {
        const book = await BookModel.findOne({ _id:id });
        if (!book) {
            res.status(404).json({ message: "No se encontró el libro con ese Id." });
            return 
        }
        res.json({ book });
        return;
    }

    const filterParams = {
        category: category ? { $in: [category] } : undefined,
        publicationYear: publicationYear ? Number(publicationYear) : undefined,
        publisher: publisher ? publisher as string : undefined,
        author: author ? author as string : undefined,
        title: title ? { $regex: new RegExp(title as string, "i") } : undefined,
        ISBN: ISBN ? ISBN as string : undefined,
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

async function bookUpdate(req: Request, res: Response) {
    const { ISBN } = req.params;
    const data =  req.body;

    try {
        const updatedBook = await BookModel.findOneAndUpdate(
            { ISBN: ISBN}, 
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

export { createBook, searchBook, bookUpdate}