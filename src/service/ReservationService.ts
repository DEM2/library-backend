import {ReservationModel} from '../models/reservationModel';
import {BookModel} from '../models/bookModel';

class ReservationService{

    static async createReservation(userId: string, bookId: string) {
        const book = await BookModel.findById(bookId);
        if (!book) throw new Error('Libro no encontrado');
    
        if (book.availableCopies <= 0) {
          throw new Error('No hay copias disponibles para este libro');
        }
    
        book.availableCopies -= 1;
        await book.save();
    
        const reservation = new ReservationModel({
          userId,
          bookId,
          reservationDate: new Date(),
          returnDate: null,
        });
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
        return await ReservationModel.find({ userId }).populate('book', 'title').exec();
    }

    static async getBookReservationHistory(bookId: string) {
        return await ReservationModel.find({ bookId }).populate('user', 'name').exec();
      }
    
}

export default ReservationService