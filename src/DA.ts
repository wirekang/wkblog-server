import Sequelize from 'sequelize';
import Ignore from 'Ignore';
import makeLog from 'makeLog';

export default class DA {
  private sequelize;

  private log;

  constructor() {
    this.log = makeLog('DB');

    this.sequelize = new Sequelize.Sequelize(
      Ignore.mariadb.database, Ignore.mariadb.user, Ignore.mariadb.password, {
        host: Ignore.mariadb.host,
        port: Ignore.mariadb.port,
        dialect: 'mariadb',
      },
    );
  }

  async sync(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      this.log('OK');
      this.define();
      await this.sequelize.sync();
      this.log('Synced');
    } catch (e) {
      this.log(e);
    }
  }

  private define(): void {
    const Post = this.sequelize.define('Post', {
      title: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DataTypes.DATEONLY,
        allowNull: false,
      },
      body: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
    });

    const Tag = this.sequelize.define('Tag', {
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
    });

    const Comment = this.sequelize.define('Comment', {
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      body: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
    });

    Post.hasMany(Comment);
    Comment.belongsTo(Post);
    Post.hasMany(Tag);
    Tag.belongsTo(Post);
  }
}
