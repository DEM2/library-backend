import { Router } from 'express';
import {reserveBook, returnBook, getUserReservationHistory, getBookReservationHistory} from '../controllers/reservationController'
import {createUser, Login, userUpdate, assignPermissions, DeleteUser} from '../controllers/userController';
import {createBook, searchBook, bookUpdate, DeleteBook} from '../controllers/bookController'
import {userAuthentication, permissionRequired, userUpdatePermission, userDisablePermission} from '../middlewares/Authentication' 

const router = Router();

//User
router.post('/users', createUser);
router.post('/login', Login);
router.patch('/users/:id', userAuthentication, userUpdatePermission, userUpdate);
router.patch('/users/:userId/permissions', assignPermissions);
router.patch('/users/:userId/disable',userAuthentication,userDisablePermission,DeleteUser)

//Book
router.post('/books', userAuthentication, permissionRequired("createBook"), createBook);
router.get('/books', searchBook);
router.patch('/books/:ISBN', userAuthentication, permissionRequired("editBook"), bookUpdate);
router.patch('/books/:bookId/disable',userAuthentication,permissionRequired("disable_books"), DeleteBook)

//Reservation
router.post('/reservations/:bookId', userAuthentication, reserveBook);
router.patch('/reservations/return/:returnId', returnBook);
router.get('/users/:userId/reservations/history', getUserReservationHistory);
router.get('/books/:bookId/reservations/history', getBookReservationHistory);


export default router;