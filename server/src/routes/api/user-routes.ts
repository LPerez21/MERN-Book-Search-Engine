import { Router } from 'express';
import {
  createUser,
  login,
  getSingleUser,
  saveBook,
  deleteBook,
} from '../../controllers/user-controller.js';
import { authenticateToken } from '../../services/auth.js';

const router = Router();

router.post('/', createUser);
router.post('/login', login);
router.get('/me', authenticateToken, getSingleUser);
router.put('/saveBook', authenticateToken, saveBook);
router.delete('/deleteBook/:bookId', authenticateToken, deleteBook);

export default router;
