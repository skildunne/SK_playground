import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Simple health-check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sports Exchange API is running' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
