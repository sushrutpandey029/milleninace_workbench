import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql_connection.js";

const DepartmentWallet = sequelize.define(
  "department_wallet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    department_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    head_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_balance:{
      type : DataTypes.DECIMAL(10,2),
      allowNull:true,
      defaultValue: 0.0
    }
  },
  {
    tableName: "department_wallet",
    timestamps: true,
  }
);

export default DepartmentWallet;