const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const data = require('../db/data/test-data/index');
const seed = require('../db/seeds/seed');
const endpoints = require('../endpoints.json');
require('jest-sorted');

beforeEach(() => {
	return seed(data);
});

afterAll(() => {
	db.end();
});

describe('Error handling for invalid endpoints', () => {
	test('GET:404 invalid endpoint given', () => {
		return request(app).get('/api/cheese').expect(404);
	});
});

describe('GET /api', () => {
	describe('Endpoint behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api').expect(200);
		});
		test('GET:200 expects response to match endpoints file', () => {
			return request(app)
				.get('/api')
				.expect(200)
				.then(({ body }) => {
					expect(body.api).toEqual(endpoints);
				});
		});
	});
});

describe('GET /api/topics', () => {
	describe('Endpoint behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api/topics').expect(200);
		});
		test('GET:200 expects array of objects with correct keys', () => {
			return request(app)
				.get('/api/topics')
				.expect(200)
				.then(({ body }) => {
					const topics = body.topics;
					expect(topics).toHaveLength(3);
					topics.forEach((topic) => {
						expect(typeof topic.slug).toBe('string');
						expect(typeof topic.description).toBe('string');
					});
				});
		});
	});
});

describe('GET /api/users', () => {
	describe('Endpoint Behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api/users').expect(200);
		});
		test('GET:200 expects a copy of the user object', () => {
			return request(app)
				.get('/api/users')
				.then(({ body }) => {
					const users = body.users;
					expect(users).toHaveLength(4);
					const userFormat = {
						username: expect.any(String),
						name: expect.any(String),
						avatar_url: expect.any(String),
					};
					users.forEach((user) => {
						expect(user).toMatchObject(userFormat);
					});
				});
		});
		test('GET:200 expects user content to be correct', () => {
			return request(app)
				.get('/api/users')
				.then(({ body }) => {
					const expectedUser = {
						username: 'butter_bridge',
						name: 'jonny',
						avatar_url:
							'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
					};
					const users = body.users;
					expect(users[0]).toEqual(expectedUser);
				});
		});
	});
});

describe.only('GET /api/articles', () => {
	describe('Endpoint behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api/articles').expect(200);
		});
		test('GET:200 expects array of articles with correct keys', () => {
			return request(app)
				.get('/api/articles')
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toHaveLength(5);
					const articleFormat = {
						title: expect.any(String),
						topic: expect.any(String),
						author: expect.any(String),
						body: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
					};

					articleFormat.comment_count = expect.any(Number);
					delete articleFormat.body;

					articles.forEach((article) => {
						expect(article).toMatchObject(articleFormat);
					});
				});
		});
		test('GET:200 expects array of articles with correct comment counts', () => {
			return request(app)
				.get('/api/articles')
				.then(({ body }) => {
					const articles = body.articles;
					const correctArr = [2, 1, 2, 11, 2];
					const testArr = articles.map((article) => {
						return article.comment_count;
					});
					expect(testArr).toEqual(correctArr);
				});
		});
		test('GET:200 expects array of articles with correct default order and sort type', () => {
			return request(app)
				.get('/api/articles')
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toBeSortedBy('created_at', {
						descending: true,
					});
				});
		});
		test('GET:200 expects array of articles to only contain matching topics', () => {
			return request(app)
				.get('/api/articles?topic=cats')
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toHaveLength(1);
					articles.forEach((article) => {
						expect(article.topic).toBe('cats');
					});
				});
		});
		test('GET:200 expects empty array when topic without articles is requested', () => {
			return request(app)
				.get('/api/articles?topic=paper')
				.expect(200)
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toHaveLength(0);
				});
		});
		test('GET:200 expects articles to have their order asc', () => {
			return request(app)
				.get('/api/articles?order=asc')
				.expect(200)
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toBeSortedBy('created_at', {
						descending: false,
					});
				});
		});
		test('GET:200 expects articles to be sorted by comment_count', () => {
			return request(app)
				.get('/api/articles?sort_by=comment_count')
				.expect(200)
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toBeSortedBy('comment_count', {
						descending: true,
					});
				});
		});
		test('GET:200 expects articles to be sorted by comment_count and order set to asc', () => {
			return request(app)
				.get('/api/articles?sort_by=comment_count&order=asc')
				.expect(200)
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toBeSortedBy('comment_count', {
						descending: false,
					});
				});
		});
	});
	describe('Endpoint error handling', () => {
		test('GET:404 expects error when topic does not exist ', () => {
			return request(app)
				.get('/api/articles?topic=dogs')
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('slug does not exist');
				});
		});
		test('GET:400 expects error when given invalid order query', () => {
			return request(app)
				.get('/api/articles?order=cheese')
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('invalid order query');
				});
		});
		test('GET:400 expects error when given invalid sort_by query', () => {
			return request(app)
				.get('/api/articles?sort_by=cheese')
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('invalid sort query');
				});
		});
	});
});

describe('GET /api/articles/:article_id', () => {
	describe('Endpoint behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api/articles/1').expect(200);
		});
		test('GET:200 expects response to have correct format', () => {
			return request(app)
				.get('/api/articles/1')
				.then(({ body }) => {
					const article = body.article;
					const articleFormat = {
						author: expect.any(String),
						title: expect.any(String),
						article_id: expect.any(Number),
						body: expect.any(String),
						topic: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					};
					expect(article).toMatchObject(articleFormat);
				});
		});
		test('GET:200 expects response to have correct content', () => {
			return request(app)
				.get('/api/articles/1')
				.then(({ body }) => {
					const article = body.article;
					const articleOne = {
						article_id: 1,
						title: 'Living in the shadow of a great man',
						author: 'butter_bridge',
						topic: 'mitch',
						body: 'I find this existence challenging',
						created_at: '2020-07-09T20:11:00.000Z',
						votes: 100,
						comment_count: 11,
						article_img_url:
							'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
					};
					expect(article).toEqual(articleOne);
				});
		});
	});
	describe('Endpoint error handling', () => {
		test('GET:404 expects error when ID does not exist', () => {
			return request(app)
				.get('/api/articles/600')
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('article_id does not exist');
				});
		});
		test('GET:400 expects error when ID not a valid type', () => {
			return request(app)
				.get('/api/articles/cheese')
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('article_id must be a number');
				});
		});
	});
});

describe('GET /api/articles/:article_id/comments', () => {
	describe('Endpoint Behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api/articles/1/comments').expect(200);
		});
		test('GET:200 expects correct comment format & correct quantity', () => {
			return request(app)
				.get('/api/articles/1/comments')
				.then(({ body }) => {
					const articleFormat = {
						comment_id: expect.any(Number),
						votes: expect.any(Number),
						created_at: expect.any(String),
						author: expect.any(String),
						body: expect.any(String),
						article_id: expect.any(Number),
					};
					const comments = body.comments;
					expect(comments).toHaveLength(11);
					comments.forEach((comment) => {
						expect(comment).toMatchObject(articleFormat);
					});
				});
		});
		test('GET:200 expects correct ordered by default from newest ASC', () => {
			return request(app)
				.get('/api/articles/1/comments')
				.then(({ body }) => {
					const comments = body.comments;
					expect(comments).toBeSortedBy('created_at', {
						descending: true,
					});
				});
		});
	});
	describe('Endpoint error handling', () => {
		test('GET:404 expects error when ID does not exist', () => {
			return request(app)
				.get('/api/articles/600/comments')
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('article_id does not exist');
				});
		});
		test('GET:400 expects error when ID not a valid type', () => {
			return request(app)
				.get('/api/articles/cheese/comments')
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('article_id must be a number');
				});
		});
		test('GET:200 expects empty array when article has no comments', () => {
			return request(app)
				.get('/api/articles/2/comments')
				.expect(200)
				.then(({ body }) => {
					expect(body.comments.length).toBe(0);
				});
		});
	});
});

describe('POST /api/articles/:article_id/comments', () => {
	describe('Endpoint Behaviour', () => {
		test('GET:201 expects correct status code', () => {
			return request(app)
				.post('/api/articles/1/comments')
				.send({
					username: 'lurker',
					body: 'not enough cheese',
				})
				.expect(201);
		});
		test('GET:201 expects inserted comment back with correct format', () => {
			return request(app)
				.post('/api/articles/1/comments')
				.send({
					username: 'lurker',
					body: 'not enough cheese',
				})
				.then(({ body }) => {
					const comment = body.comment;
					const commentFormat = {
						article_id: expect.any(Number),
						author: expect.any(String),
						body: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
					};
					expect(commentFormat).toMatchObject(comment);
				});
		});
		test('GET:201 expects original data not to be modified by POST and that article ID is correct', () => {
			const post = {
				username: 'lurker',
				body: 'not enough cheese',
			};
			return request(app)
				.post('/api/articles/1/comments')
				.send(post)
				.then(({ body }) => {
					const comment = body.comment;
					expect(comment.body).toEqual(post.body);
					expect(comment.author).toEqual(post.username);
					expect(comment.article_id).toBe(1);
				});
		});
	});
	describe('Endpoint error handling', () => {
		test('GET:404 expects error when ID does not exist', () => {
			return request(app)
				.post('/api/articles/600/comments')
				.send({
					username: 'lurker',
					body: 'not enough cheese',
				})
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('article_id does not exist');
				});
		});
		test('GET:400 expects error when ID is an invalid type', () => {
			return request(app)
				.post('/api/articles/cheese/comments')
				.send({
					username: 'lurker',
					body: 'not enough cheese',
				})
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('article_id must be a number');
				});
		});
		test('GET:400 expects error when username is an invalid type', () => {
			return request(app)
				.post('/api/articles/1/comments')
				.send({
					username: 5,
					body: 'hi',
				})
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Invalid post contents');
				});
		});
		test('GET:400 expects error when username is not recognised', () => {
			return request(app)
				.post('/api/articles/1/comments')
				.send({
					username: 'steve',
					body: 'hi',
				})
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Invalid post contents');
				});
		});
	});
});

describe('PATCH /api/articles/:article_id', () => {
	describe('Endpoint Behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app)
				.patch('/api/articles/1')
				.send({ inc_votes: 100 })
				.expect(200);
		});
		test('GET:200 expects response of updated article', () => {
			return request(app)
				.patch('/api/articles/1')
				.send({ inc_votes: 100 })
				.then(({ body }) => {
					const article = body.article;
					const articleFormat = {
						title: expect.any(String),
						topic: expect.any(String),
						author: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
					};
					expect(article).toMatchObject(articleFormat);
				});
		});
		test('GET:200 expects vote count to be updated when negative supplied', () => {
			return request(app)
				.patch('/api/articles/1')
				.send({ inc_votes: -50 })
				.then(({ body }) => {
					const article = body.article;
					expect(article.votes).toBe(50);
				});
		});
	});
	describe('Endpoint error handling', () => {
		test('GET:404 expects error when ID does not exist', () => {
			return request(app)
				.patch('/api/articles/600')
				.send({ inc_votes: 100 })
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('article_id does not exist');
				});
		});
		test('GET:400 expects error when article_id is an invalid type', () => {
			return request(app)
				.patch('/api/articles/cheese')
				.send({ inc_votes: 100 })
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('article_id must be a number');
				});
		});
		test('GET:400 expects error when inc_votes is an invalid type', () => {
			return request(app)
				.patch('/api/articles/1')
				.send({ inc_votes: 'cheese' })
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('inc_votes must be a number');
				});
		});
		test('GET:400 expects error when ID not a valid type', () => {
			return request(app)
				.patch('/api/articles/1')
				.send({ increaseMyVotes: 100 })
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('request must include inc_votes key');
				});
		});
	});
});

describe('DELETE /api/comments/:comment_id', () => {
	describe('Endpoint behaviour', () => {
		test('DELETE:204 expects correct status code', () => {
			return request(app).delete('/api/comments/1').expect(204);
		});
		test('DELETE:204 expects data to be deleted', () => {
			return request(app)
				.delete('/api/comments/1')
				.then(() => {
					return request(app).delete('/api/comments/1').expect(404);
				});
		});
	});
	describe('Endpoint error handling', () => {
		test('DELETE:400 expects error when comment_id is an invalid type', () => {
			return request(app)
				.delete('/api/comments/cheese')
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('comment_id must be a number');
				});
		});
		test('DELETE:404 expects error when comment_id does not exist', () => {
			return request(app)
				.delete('/api/comments/999')
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('comment_id does not exist');
				});
		});
	});
});
