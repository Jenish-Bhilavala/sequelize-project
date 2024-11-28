module.exports = (sequelize, Sequeilze) => {
  const portfolioModel = sequelize.define(
    'portfolio',
    {
      id: {
        type: Sequeilze.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      project_name: {
        type: Sequeilze.STRING,
        allowNull: false,
      },
      category_id: {
        type: Sequeilze.INTEGER,
        allowNull: false,
        references: {
          model: 'category',
          key: 'id',
        },
      },
      description: {
        type: Sequeilze.STRING,
        allowNull: false,
      },
      image: {
        type: Sequeilze.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  portfolioModel.associate = function (model) {
    portfolioModel.belongsTo(model.categoryModel, {
      foreignKey: 'category_id',
    });
  };
  return portfolioModel;
};
