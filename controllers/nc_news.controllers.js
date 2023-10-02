const { fetchTopics } = require('../models/nc_news.models');

exports.getTopics = (req, res, next) => {
	fetchTopics()
		.then((data) => {
			res.status(200).send({ topics: data });
		})
		.catch((err) => {
			next(err);
		});
};
