module.exports = (sequelize, Sequelize) => {
  const categoryModel = sequelize.define(
    'category',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updated_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },

    {
      freezeTableName: true,
      timestamps: false,
      // createdAt: 'created_at',
      // updatedAt: 'updated_at',
    }
  );
  return categoryModel;
};
