const Blog = require('./blog');
const User = require('./user');

User.hasMany(Blog, { as: 'blogs', foreignKey: 'userId' });
Blog.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = { Blog, User };
