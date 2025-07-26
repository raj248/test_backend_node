import { Request, Response } from 'express';
import { SearchModel } from '~/models/search.model';

export const SearchController = {
  async searchAll(req: Request, res: Response) {
    const { query } = req.query;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ success: false, error: 'Search query is required.' });
    }

    const result = await SearchModel.searchAll(query.trim());

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json(result);
  }
};
