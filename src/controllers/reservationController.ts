import { Request, Response } from 'express';
import ReservationService from '../service/ReservationService';

async  function reserveBook(request: Request, res: Response) {
    try {
      const { userId } =(request as any).user;
      const { bookId } = request.params;

      const reservation = await ReservationService.createReservation(userId, bookId);
      res.status(201).json({ message: 'Reserva creada exitosamente', reservation });
      return
    } catch (error) {
      res.status(400).json({ error: (error as Error).message});
      return
    }
  }

async  function returnBook(req: Request, res: Response) {
    try {
      const { returnId } = req.params;

      const reservation = await ReservationService.returnBook(returnId);
      res.status(200).json({ message: 'Libro devuelto exitosamente', reservation });
      return
    } catch (error) {
      res.status(400).json({  error: (error as Error).message });
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

export {reserveBook, returnBook, getUserReservationHistory, getBookReservationHistory}