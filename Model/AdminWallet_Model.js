import { DataTypes } from "sequelize";
import sequelize from "../Database/MySql_connection.js";

const AdminWallet = sequelize.define(
  "admin_wallet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    total_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "admin_wallet",
    timestamps: true,
  }
);

export default AdminWallet;