const topicsRouter = require('express').Router();
const { getTopics } = require('../controllers/nc_news.controllers');

topicsRouter.route('/').get(getTopics);

module.exports = topicsRouter;
