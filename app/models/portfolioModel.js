module.exports = (sequelize, Sequelize) => {
  const portfolioModel = sequelize.define(
    'portfolio',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      project_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'category',
          key: 'id',
        },
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
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
