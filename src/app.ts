import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import errorMiddleware from './middleware/error.middleware.js';
import addressRoutes from './routes/address.routes.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import cartRoutes from './routes/cart.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import orderRoutes from './routes/order.routes.js';
import promoRoutes from './routes/promo.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';

dotenv.config();

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || '*'
	})
);

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', message: 'Bookhaven API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promo', promoRoutes);

app.use(errorMiddleware);

export default app;
