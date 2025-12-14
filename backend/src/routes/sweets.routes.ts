import { Router, Response } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { upload } from '../middlewares/upload.middleware';
import fs from 'fs';
import path from 'path';

const router = Router();

router.use(authMiddleware);

// Upload Cover Image (Admin only)
router.post('/cover', adminMiddleware, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }
    
    // Rename/Move to a standard cover image name if desired, or just return the path
    // For simplicity, let's just use the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Optionally, we could delete the old cover if we track it, or overwrite a specific file 'cover.jpg'
    // But uniqueness avoids cache issues. We can store this in a "SystemConfig" table if we had one.
    // For now, let's just return the URL and let the frontend store it in localStorage or just use the latest one?
    // User requirement: "Add a cover image upload section... This image represents the sweet shop’s banner/cover photo."
    // If I don't store the URL in DB, it will be lost on refresh unless I overwrite a specific file.
    // Let's overwrite 'cover-image.jpg' manually.
    
    const targetPath = path.join(__dirname, '../../uploads/cover-image.jpg');
    fs.copyFileSync(req.file.path, targetPath);
    fs.unlinkSync(req.file.path); // Remove the unique temp file
    
    res.json({ imageUrl: '/uploads/cover-image.jpg?t=' + Date.now() }); // timestamp to bust cache
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// Create Sweet (Admin only)
router.post('/', adminMiddleware, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, price, quantity } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const sweet = await prisma.sweet.create({
      data: { 
        name, 
        category, 
        price: parseFloat(price), 
        quantity: parseInt(quantity),
        imageUrl
      },
    });
    res.status(201).json(sweet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sweet' });
  }
});

// Get All Sweets
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sweets = await prisma.sweet.findMany();
    const result = sweets.map(sweet => ({
      ...sweet,
      lowStock: sweet.quantity < 5
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sweets' });
  }
});

// Search Sweets
router.get('/search', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const where: any = {};

    if (name) where.name = { contains: String(name) };
    if (category) where.category = { contains: String(category) };
    if (minPrice) where.price = { ...where.price, gte: parseFloat(String(minPrice)) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(String(maxPrice)) };

    const sweets = await prisma.sweet.findMany({ where });
    const result = sweets.map(sweet => ({
      ...sweet,
      lowStock: sweet.quantity < 5
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search sweets' });
  }
});

// Update Sweet (Admin only)
router.put('/:id', adminMiddleware, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;
    
    const data: any = { 
      name, 
      category, 
      price: parseFloat(price), 
      quantity: parseInt(quantity) 
    };

    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    const sweet = await prisma.sweet.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(sweet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sweet' });
  }
});

// Delete Sweet (Admin only)
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.sweet.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sweet' });
  }
});

// Purchase Sweet
router.post('/:id/purchase', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body; // Default to 1 if not provided
    const sweetId = parseInt(id);
    const userId = req.user.id;
    const purchaseQty = parseInt(quantity);

    if (purchaseQty <= 0) {
      res.status(400).json({ error: 'Invalid quantity' });
      return;
    }

    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
        const sweet = await prisma.sweet.findUnique({ where: { id: sweetId } });
        if (!sweet) throw new Error('Sweet not found');
        if (sweet.quantity < purchaseQty) throw new Error('Insufficient stock');

        const updatedSweet = await prisma.sweet.update({
            where: { id: sweetId },
            data: { quantity: sweet.quantity - purchaseQty }
        });

        // Create a purchase record with quantity and total price
        await prisma.purchase.create({
            data: {
                userId,
                sweetId,
                quantity: purchaseQty,
                totalPrice: sweet.price * purchaseQty
            }
        });

        return { sweet: updatedSweet, count: purchaseQty };
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Purchase failed' });
  }
});

// Restock Sweet (Admin only)
router.post('/:id/restock', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { quantity } = req.body; // Amount to add
        const sweetId = parseInt(id);
        const amountToAdd = parseInt(quantity);

        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            res.status(400).json({ error: 'Invalid quantity' });
            return;
        }

        const sweet = await prisma.sweet.findUnique({ where: { id: sweetId } });
        if (!sweet) {
            res.status(404).json({ error: 'Sweet not found' });
            return;
        }

        const updatedSweet = await prisma.sweet.update({
            where: { id: sweetId },
            data: { quantity: sweet.quantity + amountToAdd }
        });

        res.json(updatedSweet);
    } catch (error) {
        res.status(500).json({ error: 'Restock failed' });
    }
});

export default router;
