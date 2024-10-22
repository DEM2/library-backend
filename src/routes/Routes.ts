import { Router } from 'express';
import {createUser, createBook, Login} from '../controllers/Controller'
import {userAuthentication} from '../middlewares/Authentication' 

const router = Router();

router.post('/register-U', createUser);
router.post('/books/create',userAuthentication,createBook);
router.post('/login', Login)

export default router;