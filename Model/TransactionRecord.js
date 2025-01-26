import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql_connection.js";

const TransactionRecord = sequelize.define(
  "transaction_records",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    dept_from_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    dept_from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dept_to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "transaction_records",
    timestamps: true,
  }
);

export default TransactionRecord;
