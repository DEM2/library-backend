import { Router } from 'express';
import {createUser, createBook} from '../controllers/Controller'

const router = Router();

router.post('/register-U', createUser);
router.post('/books/create',createBook);

export default router;