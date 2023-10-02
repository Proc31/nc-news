const { fetchTopics } = require('../models/nc_news.models');

exports.getTopics = (req, res, next) => {
	fetchTopics()
		.then((result) => {
			res.status(200).send(result.rows);
		})
		.catch((err) => {
			next(err);
		});
};
