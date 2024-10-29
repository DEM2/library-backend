import { Router } from 'express';
import {createUser, createBook, Login, searchBook} from '../controllers/Controller'
import {userAuthentication, permissionRole} from '../middlewares/Authentication' 

const router = Router();

router.post('/users/create', createUser);
router.post('/books/create',userAuthentication,permissionRole(['Administrador']),createBook);
router.post('/login', Login);
router.post('/books', searchBook)

export default router;