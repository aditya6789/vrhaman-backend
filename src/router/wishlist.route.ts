import { Router } from 'express';
import { addToWishlist, getUserWishlist, removeFromWishlist } from '../controllers/wishlist.controller';

const router = Router();

router.post('/', addToWishlist);
router.get('/', getUserWishlist);
router.delete('/', removeFromWishlist);

export default router;
