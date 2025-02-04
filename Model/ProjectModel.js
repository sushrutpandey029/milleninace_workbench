import { DataTypes } from "sequelize";

import sequelize from "../Database/MySql_connection.js";

const ProjectModel = sequelize.define('projects',{
    project_name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    client:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    total_amount:{
        type:DataTypes.STRING,
        allowNull: false
    },
    assigned_dept:{
        type:DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'projects',
    timestamps: true,
})

export default ProjectModel;