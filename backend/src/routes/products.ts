import express from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /products
// @desc    Get all available products (Can add search/filtering later)
router.get('/', async (req, res) => {
    try {
        // Fetch products that are 'AVAILABLE'
        const products = await prisma.product.findMany({
            where: { status: 'AVAILABLE' },
            include: {
                seller: { select: { id: true, email: true } }, // Include seller info, but hide password!
            },
            orderBy: { createdAt: 'desc' }, // Newest first
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// @route   GET /products/:id
// @desc    Get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { seller: { select: { id: true, email: true } } },
        });

        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// @route   POST /products
// @desc    Create a new product listing
// @access  Private (Requires valid JWT token)
router.post('/', authenticate, async (req: AuthRequest, res) => {
    const { title, description, price, condition, imageUrl } = req.body;
    const sellerId = req.user?.id; // Extracted from JWT token via middleware

    if (!sellerId) {
        return res.status(401).json({ error: 'Unauthorized: No user ID attached to token' });
    }

    try {
        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price,
                condition,
                imageUrl,
                sellerId, // Link product to the authenticated user
                status: 'AVAILABLE',
            },
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product listing' });
    }
});

export default router;
