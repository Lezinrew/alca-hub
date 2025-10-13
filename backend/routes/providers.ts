import { Router, Request, Response } from 'express';
import { Provider, Category } from '../models';
import mongoose from 'mongoose';

const router = Router();

// GET /providers - Busca prestadores com filtros
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const {
      category,
      city,
      verified,
      q,
      page = '1',
      limit = '20',
      sortBy = 'isVerified',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filters: any = {};

    // Filtro por categoria
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        filters.categoryIds = categoryDoc._id;
      }
    }

    // Filtro por cidade
    if (city) {
      filters.addressCity = { $regex: city, $options: 'i' };
    }

    // Filtro por verificação
    if (verified !== undefined) {
      filters.isVerified = verified === 'true';
    }

    // Busca textual
    if (q) {
      filters.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { coverageArea: { $regex: q, $options: 'i' } }
      ];
    }

    // Paginação
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Ordenação
    const sort: any = {};
    if (sortBy === 'isVerified') {
      sort.isVerified = sortOrder === 'desc' ? -1 : 1;
      sort.rating = -1;
      sort.name = 1;
    } else if (sortBy === 'rating') {
      sort.rating = sortOrder === 'desc' ? -1 : 1;
      sort.name = 1;
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'desc' ? -1 : 1;
    }

    // Executar consulta
    const [providers, total] = await Promise.all([
      Provider.find(filters)
        .populate('categoryIds', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Provider.countDocuments(filters)
    ]);

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    res.json({
      providers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? pageNum + 1 : null,
        prevPage: hasPrev ? pageNum - 1 : null
      },
      filters: {
        category,
        city,
        verified,
        q,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Erro ao buscar prestadores:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar prestadores'
    });
  }
});

// GET /categories - Lista todas as categorias
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();

    res.json({
      categories,
      total: categories.length
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar categorias'
    });
  }
});

// GET /providers/:id - Busca prestador específico
router.get('/providers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: 'ID inválido',
        message: 'O ID do prestador deve ser um ObjectId válido'
      });
    }

    const provider = await Provider.findById(id)
      .populate('categoryIds', 'name')
      .lean();

    if (!provider) {
      return res.status(404).json({ 
        error: 'Prestador não encontrado',
        message: 'Nenhum prestador encontrado com o ID fornecido'
      });
    }

    res.json({ provider });

  } catch (error) {
    console.error('Erro ao buscar prestador:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o prestador'
    });
  }
});

// GET /providers/stats - Estatísticas dos prestadores
router.get('/providers/stats', async (req: Request, res: Response) => {
  try {
    const [
      total,
      verified,
      unverified,
      byCategory,
      byCity
    ] = await Promise.all([
      Provider.countDocuments(),
      Provider.countDocuments({ isVerified: true }),
      Provider.countDocuments({ isVerified: false }),
      Provider.aggregate([
        { $unwind: '$categoryIds' },
        { $lookup: { from: 'categories', localField: 'categoryIds', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $group: { _id: '$category.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Provider.aggregate([
        { $group: { _id: '$addressCity', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      total,
      verified,
      unverified,
      byCategory,
      byCity
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar estatísticas'
    });
  }
});

export default router;
