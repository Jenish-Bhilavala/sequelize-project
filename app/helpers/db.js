const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER_NAME,
  process.env.DATABASE_PASSWORD,
  {
    dialect: process.env.DIALECT,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/userModel")(sequelize, Sequelize);

db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synchronized successfully.");
});
module.exports = db;
