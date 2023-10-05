const commentsRouter = require('express').Router();
const {
	patchCommentById,
	deleteCommentById,
} = require('../controllers/nc_news.controllers');

commentsRouter
	.route('/:comment_id')
	.delete(deleteCommentById)
	.patch(patchCommentById);

module.exports = commentsRouter;
