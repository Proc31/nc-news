const usersRouter = require('express').Router();
const { getUsers, getUserById } = require('../controllers/nc_news.controllers');

usersRouter.route('/').get(getUsers);

usersRouter.route('/:username').get(getUserById);
module.exports = usersRouter;
