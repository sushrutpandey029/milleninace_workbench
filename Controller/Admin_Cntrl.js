import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Adminmodel from "../Model/Admin_Model.js";
import AdminWallet from "../Model/AdminWallet_Model.js";
import Head from "../Model/Dept.head_Model.js";
import DepartmentWallet from "../Model/DepartmentWallet .js";
import ProjectModel from "../Model/ProjectModel.js";

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

    const adminWallet = await AdminWallet.findOne({
      attributes: ["total_balance"],
      order: [["id", "DESC"]],
    });

    const totalBalance = adminWallet?.dataValues?.total_balance || 0.0;

    // Pass user data to the view
    res.render("admin_dashboard", { user, totalBalance });
  } catch (error) {
    console.error("Error in Admindashboard:", error);
    return res
      .status(500)
      .send({ message: "Internal Server Error", err: error.message });
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

export const saveDeptHead = async (req, res) => {
  try {
    const {
      department,
      dept_head_name,
      email,
      phone,
      designation,
      password,
      employes,
    } = req.body;

    // Validate required fields
    if (
      !department ||
      !dept_head_name ||
      !email ||
      !phone ||
      !designation ||
      !password
    ) {
      req.flash("error", "All fields are required");
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      req.flash("error", "Invalid email format");
    }

    // Validate phone format (e.g., 10-digit Indian phone number)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      req.flash(
        "error",
        "Invalid phone number. It should be a 10-digit number starting with 6-9."
      );
    }

    const employeeData = employes ? employes : [];

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the department head and employees
    const newDeptHead = await Head.create({
      department,
      dept_head_name,
      email,
      phone,
      designation,
      password: hashedPassword, // Save the hashed password
      normalpassword: password, // Save the original password
      employes: employeeData, // Convert to JSON string for database storage
    });

    return res.redirect("/getDeptHeads");

    // res.render('/addheads')
  } catch (error) {
    console.error("Error saving department head:", error);
    res.status(500).send({
      message: "Error saving department head",
      error: error.message,
    });
  }
};

export const getDeptHeads = async (req, res) => {
  try {
    let deptHeads = await Head.findAll();

    if (!deptHeads || deptHeads.length === 0) {
      // return res.status(404).json({ message: "No department heads found" });
      deptHeads = [];
    }

    // res.status(200).json({
    //     message: 'Departments and employees retrieved successfully',
    //     data: deptHeads
    // });

    res.render("headlist_emply", { data: deptHeads });
  } catch (error) {
    console.error("Error fetching department heads:", error);
    res.status(500).send({
      message: "Error fetching department heads",
      error: error.message,
    });
  }
};

export const AdminWalletPage = async (req, res) => {
  return res.render("wallet");
};

export const Admin_Wallet = async (req, res) => {
  try {
    const { balance } = req.body;

    if (!balance) {
      req.flash("error", "balance is required");
      return;
    }

    let totalWallet = await AdminWallet.findOne({
      attributes: ["total_balance"],
      order: [["id", "DESC"]],
    });

    console.log("total wallet", totalWallet);

    totalWallet =
      (parseFloat(totalWallet?._previousDataValues?.total_balance) || 0) +
      parseFloat(balance);

    const amount = new AdminWallet({ balance, total_balance: totalWallet });
    const response = await amount.save();

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
    // console.log("user-paydept",user);

    const department = user.dataValues.department;
    console.log("departmet",department)

    const proj_data = await ProjectModel.findAll(
      {where:{assigned_Dept:department}}
    )

    console.log("response",proj_data);  

    res.render("pay_dept", { user,proj_data });
  } catch (err) {
    console.log("err in admin wallet controller".err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

// export const AddPaymentToDept = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await Head.findByPk(id);
//   } catch (err) {
//     console.log("err in admin wallet controller".err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       err: err.message,
//     });
//   }
// };

export const AddDeptWallet = async (req, res) => {
  try {
    const { department_id, department_name, head_name, balance,project_id } = req.body;

    console.log(department_id, department_name, head_name, balance,project_id);

    if (!head_name || !balance || !project_id) {
      req.flash("error", "all fields are required");
      return;
    }

    //subtracting the paid amount from admin_wallet
    let totalBalance = await AdminWallet.findOne({
      attributes: ["total_balance", "id"],
      order: [["id", "DESC"]],
    });

    // handling the total balance of a department wallet

    const dept = await DepartmentWallet.findOne({
      attributes:["total_balance"],
      where:{department_id },
      order: [["id", "DESC"]],
    });

    let dept_totalBalance = dept?.dataValues?.total_balance || 0;
    let parsed = parseFloat(dept_totalBalance);
    parsed += parseFloat(balance);

    console.log("department_id", department_id);
    console.log("dpt", dept);

    const ids = totalBalance?.dataValues?.id;

    totalBalance =
      parseFloat(totalBalance?.dataValues?.total_balance) - parseFloat(balance);

    await AdminWallet.update(
      { total_balance: totalBalance },
      {
        where: { id: ids },
      }
    );

    const data = new DepartmentWallet({
      department_id,
      project_id,
      department_name,
      total_balance:parsed,
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

export const AssignProjectPage = async (req, res) => {
  try{
    return res.render("assign_project")
  }catch(err){
    return res.status(500).send({
      message:"internal server error",
      err:err.message
    })
  }
}

export const AssignProject = async (req, res) => {
  try{
    const {project_name,client,total_amount,assigned_dept} = req.body;

    if(!project_name || !client || !total_amount || !assigned_dept){
      return res.flash("error","all fields are required.")
    }

    const data = new ProjectModel({
      project_name,client,total_amount,assigned_dept
    })

    const response = await data.save();
    if(!response) {
      return res.flash("error","error in saving to database, please try again.")
    }

   return res.redirect("/project-list");

  }catch(err){
    return res.status(500).send({
      message:"internal server error",
      err:err.message
    })
  }
}

export const AssignedProjectList =async (req, res) => {
  try{
    const data = await ProjectModel.findAll();
    console.log("data",data)
    return res.render("assign_project_list",{data});
  }catch(err){
    return res.status(500).send({
      message:"internal server error",
      err:err.message
    })
  }
}



