const articlesRouter = require('express').Router();
const {
	getArticles,
	getArticleById,
	getCommentsByArticleId,
	postCommentsByArticleId,
	patchArticleById,
} = require('../controllers/nc_news.controllers');

articlesRouter.get('/', getArticles);

articlesRouter
	.route('/:article_id')
	.get(getArticleById)
	.patch(patchArticleById);

articlesRouter
	.route('/:article_id/comments')
	.get(getCommentsByArticleId)
	.post(postCommentsByArticleId);

module.exports = articlesRouter;
