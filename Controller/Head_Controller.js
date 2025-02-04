import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AdminModel from "../Model/Admin_Model.js";
import Head from "../Model/Dept.head_Model.js";
import validator from "validator";
import path from "path";
import { fileURLToPath } from "url";
import DepartmentWallet from "../Model/DepartmentWallet .js";
import TransactionRecord from "../Model/TransactionRecord.js";
import SalaryTransaction from "../Model/SalaryTransaction.js";
import AdTransactionModel from "../Model/AdTransaction.js";
import { where } from "sequelize";
import ProjectModel from "../Model/ProjectModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const head_login = async (req, res) => {
  res.render("headlogin");
};

export const addhead = async (req, res) => {
  res.render("addheads");
};



export const HeadLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      req.flash("error", "All fields are required");
      return res.status(400).redirect("/");
    }

    // Check if the user exists
    const user = await Head.findOne({ where: { email } });
    if (!user) {
      req.flash("error", "User not found");
      return res.status(401).redirect("/");
    }

    // Check if the password is correct
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      req.flash("error", "Invalid password");
      return res.status(401).redirect("/");
    }

    // Generate access and refresh tokens (optional)
    const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Store user info in session
    req.session.user = {
      id: user.id,
      dept_name: user.department,
      dept_head_name: user.dept_head_name,
      email: user.email,
      token,
      refreshToken: user.refreshToken,
    };

    //fetching project id from department wallet using department name
    // const response = await DepartmentWallet.findAll({
    //   attributes:["project_id"],
    //   where:{department_name:req.session.user.dept_name}
    // });

    // console.log("project-id",response);


    // Redirect to the dashboard
    return res.redirect("/headnewdashboard");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error logging in");
    return res.status(500).redirect("/");
  }
};

export const headnewdashboard = async (req, res) => {
  try {
    const newuser = req.session.user;
    if (!newuser) {
      req.flash("error", "Please log in to continue");
      return res.redirect("/");
    }
    const id = newuser.id;

    const userdata = await DepartmentWallet.findOne({
      attributes: ["total_balance"],
      where: { department_id: id },
      order: [["id", "DESC"]],
    });

    const totalwallet = userdata?.dataValues?.total_balance || 0.0;

    let projects = await ProjectModel.findAll({
      where:{assigned_Dept:req.session.user.dept_name}
    })

    console.log("projects",projects)
    

    // Pass user data to the view
    res.render("headdashboard", { newuser, totalwallet,projects });
  } catch (error) {
    console.error("Error in Admindashboard:", error);
    return res
      .status(500)
      .send({ message: "Internal Server Error", err: error.message });
  }
};

export const ProjectTransactionPage = async (req, res) => {
  try {
    return res.render("project_transaction");
  } catch (err) {
    console.log("err in Project Transaction Page", err.message);
  }
};

export const ProjectTransaction = async (req, res) => {
  try {
    const { project_name, dept_to, purpose, amount, transaction_date } =
      req.body;

    if (!project_name || !dept_to || !purpose || !amount || !transaction_date) {
      return req.flash("error", "all fields are required");
    }

    const dept_from_id = req.session.user.id;
    const dept_from = req.session.user.dept_name;

    // taking department to if from department head table
    const id = await Head.findOne({
      attributes: ["id"],
      where: { department: dept_to },
    });

    const dept_to_id = id.dataValues.id;

    //fetching total balance of departfrom

    const deptFrom = await DepartmentWallet.findOne({
      attributes: ["id", "total_balance"],
      where: { department_id: dept_from_id },
      order: [["id", "DESC"]],
    });

    console.log("deptFrom", deptFrom);

    let deptFrom_totalBalance = deptFrom.dataValues.total_balance || 0;
    let deptFrom_id = deptFrom.dataValues.id;

    //fetching total balance of department to

    const deptTo = await DepartmentWallet.findOne({
      attributes: ["id", "total_balance"],
      where: { department_id: dept_to_id },
      order: [["id", "DESC"]],
    });

    let deptTo_totalBalance = deptTo.dataValues.total_balance || 0;
    let deptTo_id = deptTo.dataValues.id;

    console.log("deptFrom_totalBalance", deptFrom_totalBalance);
    console.log("deptTo_totalBalance", deptTo_totalBalance);

    //handling the logic to subtract and add wallet value

    deptFrom_totalBalance = deptFrom_totalBalance - amount;
    deptTo_totalBalance = parseFloat(deptTo_totalBalance) + parseFloat(amount);

    const data = new TransactionRecord({
      project_name,
      dept_from_id,
      dept_to,
      dept_from,
      purpose,
      amount,
      transaction_date,
    });

    const resp = await data.save();

    if (!resp) {
      return res.flash(
        "error",
        "error in saving to database, please try again."
      );
    }

    // updating the wallet of both user sender and receiver

    await DepartmentWallet.update(
      { total_balance: deptTo_totalBalance },
      { where: { id: deptTo_id } }
    );

    await DepartmentWallet.update(
      { total_balance: deptFrom_totalBalance },
      { where: { id: deptFrom_id } }
    );

    res.redirect("/headnewdashboard");
  } catch (err) {
    console.log("err in ProjectTransaction", err.message);
    return res.status(500).send({
      message: "Internal server error",
      err: err.message,
    });
  }
};

export const SalaryTransactionPage = async (req, res) => {
  try {
    return res.render("salaryTransaction");
  } catch (err) {
    console.log("err in salary transaction page", err.message);
    return res.status(500).send({
      message: "Internal server error",
      err: err.message,
    });
  }
};

export const SalaryTransactions = async (req, res) => {
  try {
    const { dept, dept_head_name, employee, salary, salary_date } = req.body;

    if (!dept || !dept_head_name || !employee || !salary || !salary_date) {
      return req.flash("err", "all fields are required.");
    }

    const dept_id = req.session.user.id;

    const dept_wallet = await DepartmentWallet.findOne({
      attributes: ["id", "total_balance"],
      where: { department_id: dept_id },
      order: [["id", "DESC"]],
    });

    const id = dept_wallet.dataValues.id;
    let dept_totalBalance = dept_wallet.dataValues.total_balance;

    //subtracting total balance from department wallet

    dept_totalBalance = parseFloat(dept_totalBalance) - salary;

    console.log("total balance dept", dept_totalBalance);

    // updating total balance in department wallet
    await DepartmentWallet.update(
      { total_balance: dept_totalBalance },
      { where: { id: id } }
    );

    const data = new SalaryTransaction({
      dept_id,
      dept,
      dept_head_name,
      employee,
      salary,
      salary_date,
    });

    const response = await data.save();

    if (!response) {
      return res.status(500).send({
        message: "error in saving in database, please try again",
      });
    }

    return res.redirect("/headnewdashboard");
  } catch (err) {
    return res.status(500).send({
      message: "Internal server error",
      err: err.message,
    });
  }
};

export const AdTransactionPage = async (req, res) => {
  try {
    return res.render("adTransaction");
  } catch (err) {
    return res.status(500).send({
      message: "internal server error",
      err: err.message,
    });
  }
};

export const AdTransaction = async (req, res) => {
  try {
    const { dept_to, ad_on, amount, date } = req.body;

    if (!dept_to || !ad_on || !amount || !date) {
      return req.flash("err", "all fields are required.");
    }

    //fetching id of destination department from Department head table
    const dept = await Head.findOne({
      attributes: ["id"],
      where: { department: dept_to },
    });

    const dept_to_id = dept.dataValues.id;

    //fetching data from session
    const dept_from = req.session.user.dept_name;
    const dept_from_id = req.session.user.id;

    const data = new AdTransactionModel({
      dept_to_id,
      dept_to,
      dept_from,
      ad_on,
      amount,
      date,
    });

    const response = await data.save();

    if (!response) {
      return req.status(500).send({
        message: "internal server error",
      });
    }

    //deduction transfer amount from source department wallet

    const dept_wallet = await DepartmentWallet.findOne({
      attributes: ["id", "total_balance"],
      where: { department_id: dept_from_id },
      order: [["id", "DESC"]],
    });

    let dept_totalBalance = dept_wallet?.dataValues?.total_balance || 0.0;
    dept_totalBalance = parseFloat(dept_totalBalance) - amount;
    let dept_id = dept_wallet.dataValues.id;

    // updating the source department wallet
    await DepartmentWallet.update(
      { total_balance: dept_totalBalance },
      { where: { id: dept_id } }
    );

    //adding amount to destination department wallet
    const dept_to_wallet = await DepartmentWallet.findOne({
      attributes: ["id", "total_balance"],
      where: { department_id: dept_to_id },
      order: [["id", "DESC"]],
    });

    let dept_to_totalBalance = dept_to_wallet?.dataValues?.total_balance || 0.0;
    dept_to_totalBalance =
      parseFloat(dept_to_totalBalance) + parseFloat(amount);

    await DepartmentWallet.update(
      { total_balance: dept_to_totalBalance },
      { where: { id: dept_to_wallet.dataValues.id } }
    );

    console.log("updated-dept_to_totalBalance", dept_to_totalBalance);
    req.flash("success", "data submitted successfully.");

    return res.redirect("/headnewdashboard");
  } catch (err) {
    return res.status(500).send({
      message: "internal server error",
      err: err.message,
    });
  }
};
