import { Router } from 'express';
import {createUser, createBook, Login, searchBook, userUpdate, bookUpdate} from '../controllers/Controller'
import {userAuthentication, permissionRole, userPermission} from '../middlewares/Authentication' 

const router = Router();

router.post('/users/create', createUser);
router.post('/books/create',userAuthentication,permissionRole(['Administrador']),createBook);
router.post('/login', Login);
router.post('/books', searchBook)
router.put('/user/update/:id',userAuthentication,userPermission, userUpdate)
router.put('/book/update/:ISBN',userAuthentication,permissionRole(['Administrador','Editor']), bookUpdate )

export default router;