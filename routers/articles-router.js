const articlesRouter = require('express').Router();
const {
	getArticles,
	postArticle,
	getArticleById,
	patchArticleById,
	deleteArticleById,
	getCommentsByArticleId,
	postCommentsByArticleId,
} = require('../controllers/nc_news.controllers');

articlesRouter.route('/').get(getArticles).post(postArticle);

articlesRouter
	.route('/:article_id')
	.get(getArticleById)
	.patch(patchArticleById)
	.delete(deleteArticleById);

articlesRouter
	.route('/:article_id/comments')
	.get(getCommentsByArticleId)
	.post(postCommentsByArticleId);

module.exports = articlesRouter;
