import { Router } from 'express';
import { addAndValidateBankAccount } from '../controllers/bank_account.controller';

const router = Router();

router.post('/validate-and-add', addAndValidateBankAccount);

export default router;
