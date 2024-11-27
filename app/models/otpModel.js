module.exports = (sequelize, Sequelize) => {
  const otpModel = sequelize.define(
    'otp',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      expireAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      updatedAt: false,
    }
  );

  return otpModel;
};
