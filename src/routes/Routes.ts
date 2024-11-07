import { Router } from 'express';
import {createUser, createBook, Login, searchBook, userUpdate, bookUpdate, assignPermissions} from '../controllers/Controller'
import {userAuthentication, permissionRequired, userPermission} from '../middlewares/Authentication' 

const router = Router();

router.post('/users/create', createUser);
router.post('/books/create',userAuthentication,permissionRequired('createBook'),createBook);
router.post('/login', Login);
router.post('/books', searchBook)
router.put('/user/update/:id',userAuthentication,userPermission, userUpdate)
router.put('/book/update/:ISBN',userAuthentication,permissionRequired("editBook"), bookUpdate )
router.put('/users/:userId/permissions', assignPermissions)


export default router;