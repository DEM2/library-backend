import {ReservationModel} from '../models/reservationModel';
import {BookModel} from '../models/bookModel';
import { MessageEvent } from 'http';

class ReservationService{

    static async createReservation(userId: string, bookId: string) {
       
        const book = await BookModel.findById(bookId);
        if (!book) throw new Error('Libro no encontrado');
    
        if (book.availableCopies <= 0) {
          throw new Error('No hay copias disponibles para este libro');
        }
    
        const reservation = new ReservationModel({
          user: userId,
          book: bookId,
          reservationDate: new Date(),
        });

        book.availableCopies -= 1;
        await book.save();
        await reservation.save();
    
        return reservation;
      }

      static async returnBook(reservationId: string) {
        const reservation = await ReservationModel.findById(reservationId);
        if (!reservation) throw new Error('Reserva no encontrada');
    
        const book = await BookModel.findById(reservation.book);
        if (!book) throw new Error('Libro no encontrado');
        
        reservation.deliveryDate = new Date();
        await reservation.save();
    
        book.availableCopies += 1;
        await book.save();
    
        return reservation;
      }

    static async getUserReservationHistory(userId: string) {
        return await ReservationModel.find({  user: userId  }).populate('book', 'title').exec();
    }

    static async getBookReservationHistory(bookId: string) {
        return await ReservationModel.find({ book:bookId }).populate('user', 'name').exec();
      }
    
}

export default ReservationService