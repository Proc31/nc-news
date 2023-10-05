const formats = {
	article: {
		title: expect.any(String),
		topic: expect.any(String),
		author: expect.any(String),
		body: expect.any(String),
		created_at: expect.any(String),
		votes: expect.any(Number),
		article_img_url: expect.any(String),
		comment_count: expect.any(Number),
	},
	comment: {
		body: expect.any(String),
		votes: expect.any(Number),
		author: expect.any(String),
		article_id: expect.any(Number),
		created_at: expect.any(String),
	},
	topic: {
		description: expect.any(String),
		slug: expect.any(String),
	},
	user: {
		username: expect.any(String),
		name: expect.any(String),
		avatar_url: expect.any(String),
	},
};

module.exports = formats;
