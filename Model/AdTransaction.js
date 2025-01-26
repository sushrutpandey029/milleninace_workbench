import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql_connection.js";

const AdminWallet = sequelize.define(
  "ad_transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dept_to_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dept_to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dept_from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ad_on: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "ad_transaction",
    timestamps: true,
  }
);

export default AdminWallet;
