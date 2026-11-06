const Blog = require('./blog');
const User = require('./user');
const ReadingList = require('./readingList');

User.hasMany(Blog, { as: 'blogs', foreignKey: 'userId' });
Blog.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.belongsToMany(Blog, { through: ReadingList, as: 'readingList', foreignKey: 'userId' });
Blog.belongsToMany(User, { through: ReadingList, as: 'readers', foreignKey: 'blogId' });

module.exports = { Blog, ReadingList, User };
