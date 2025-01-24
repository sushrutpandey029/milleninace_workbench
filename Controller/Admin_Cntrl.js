import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Adminmodel from "../Model/Admin_Model.js";
import AdminWallet from "../Model/AdminWallet_Model.js";
import Head from "../Model/Dept.head_Model.js";
import DepartmentWallet from "../Model/DepartmentWallet .js";

import validator from "validator"; // Install this package: npm install validator

import path from "path";
import { fileURLToPath } from "url";
import e from "connect-flash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const Admin_login = async (req, res) => {
  res.render("Admin_login");
};

export const AdminRegister = async (req, res) => {
  try {
    const { Admin_name, Email_id, Password } = req.body;

    // Validate input
    if (!Admin_name || !Email_id || !Password) {
      return res.status(400).send({ errormessage: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
    if (!emailRegex.test(Email_id)) {
      return res.status(400).send({ message: "Email is not valid" });
    }

    // Check for duplicate email
    const isDuplicateEmail = await Adminmodel.findOne({ where: { Email_id } });
    if (isDuplicateEmail) {
      return res.status(400).send({ errormessage: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Create new admin
    const newAdmin = await Adminmodel.create({
      ...req.body,
      Password: hashedPassword,
    });
    console.log("New Admin:", newAdmin);

    return res.status(201).send({
      status: true,
      message: "Admin created successfully",
      admin: {
        id: newAdmin.id,
        Admin_name: newAdmin.Admin_name,
        email: newAdmin.Email_id,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: "Error creating admin", err: err.message });
  }
};

export const AdminLogin = async (req, res) => {
  try {
    const { Email_id, Password } = req.body;

    // Validate input
    if (!Email_id || !Password) {
      req.flash("error", "All fields are required");
      return res.status(400).redirect("/");
    }

    // Check if the user exists
    const user = await Adminmodel.findOne({ where: { Email_id } });
    if (!user) {
      req.flash("error", "User not found");
      return res.status(401).redirect("/");
    }

    // Check if the password is correct
    const isValid = await bcrypt.compare(Password, user.Password);
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
      Admin_name: user.Admin_name,
      Email_id: user.Email_id,
      token,
      refreshToken: user.refreshToken,
    };

    // Redirect to the dashboard
    return res.status(200).redirect("/dashboard");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error logging in");
    return res.status(500).redirect("/");
  }
};

export const Admindashboard = async (req, res) => {
  try {
    const user = req.session.user;

    // Check if user is logged in
    if (!user) {
      req.flash("error", "Please log in to continue");
      return res.redirect("/");
    }

    const adminWallet = await AdminWallet.findAll();

    const totalBalance = adminWallet.reduce((sum, wallet) => {
      return sum + parseFloat(wallet.dataValues.total_balance);
    }, 0);

    console.log("total bal", totalBalance);

    // Pass user data to the view
    res.render("admin_dashboard", { user, totalBalance });
  } catch (error) {
    console.error("Error in Admindashboard:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const AdminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      req.flash("error", "Error logging out");
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    return res.redirect("/");
  });
};

export const AdminWalletPage = async (req, res) => {
  return res.render("wallet");
};

export const Admin_Wallet = async (req, res) => {
  try {
    const { total_balance } = req.body;

    if (!total_balance) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
        data: total_balance,
      });
    }

    const balance = new AdminWallet({ total_balance });
    const response = await balance.save();

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "error in storing in database",
      });
    }

    return res.redirect("/dashboard");
  } catch (err) {
    console.log("err in admin wallet controller".err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

export const getTotalWallet = async (req, res) => {
  try {
    const adminWallet = await AdminWallet.findAll();

    const totalBalance = adminWallet.reduce((sum, wallet) => {
      return sum + parseFloat(wallet.dataValues.total_balance);
    }, 0);

    console.log("totalBalance", totalBalance);
  } catch (err) {
    console.log("err in admin wallet controller".err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

export const PayDeptPage = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Head.findByPk(id);
    res.render("pay_dept", { user });
  } catch (err) {
    console.log("err in admin wallet controller".err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

export const AddPaymentToDept = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Head.findByPk(id);
  } catch (err) {
    console.log("err in admin wallet controller".err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

export const AddDeptWallet = async (req, res) => {
  try {
    const { department_id, department_name, head_name, balance } = req.body;

    console.log(department_id, department_name, head_name, balance);

    if (!head_name || !balance) {
      req.flash("error", "all fields are required");
      return;
    }

    const data = new DepartmentWallet({
      department_id,
      department_name,
      head_name,
      balance,
    });

    const response = await data.save();
    return res.redirect("/dashboard");

  } catch (err) {
    console.log("err in admin wallet controller".err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};
