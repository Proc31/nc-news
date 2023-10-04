const usersRouter = require('express').Router();
const { getUsers } = require('../controllers/nc_news.controllers');

usersRouter.route('/').get(getUsers);

module.exports = usersRouter;
