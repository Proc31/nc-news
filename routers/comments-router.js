const commentsRouter = require('express').Router();
const { deleteCommentById } = require('../controllers/nc_news.controllers');

commentsRouter.route('/:comment_id').delete(deleteCommentById);

module.exports = commentsRouter;
