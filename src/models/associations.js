const Blog = require('./blog');
const Session = require('./session');
const User = require('./user');
const ReadingList = require('./readingList');

User.hasMany(Blog, { as: 'blogs', foreignKey: 'userId' });
Blog.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.belongsToMany(Blog, { through: ReadingList, as: 'readings', foreignKey: 'userId' });
Blog.belongsToMany(User, { through: ReadingList, as: 'readers', foreignKey: 'blogId' });
User.hasMany(Session, { as: 'sessions', foreignKey: 'userId' });
Session.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = { Blog, ReadingList, Session, User };
