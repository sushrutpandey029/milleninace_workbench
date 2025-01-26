import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql_connection.js";

const AdminWallet = sequelize.define(
  "salary_transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dept_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dept: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dept_head_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employee: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    salary_date: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "salary_transaction",
    timestamps: true,
  }
);

export default AdminWallet;
