import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AdminModel from "../Model/Admin_Model.js";
import Head from "../Model/Dept.head_Model.js";
import validator from "validator";
import path from "path";
import { fileURLToPath } from "url";
import DepartmentWallet from "../Model/DepartmentWallet .js";
import TransactionRecord from "../Model/TransactionRecord.js";
import { where } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const head_login = async (req, res) => {
  res.render("headlogin");
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

export const addhead = async (req, res) => {
  res.render("addheads");
};

export const getDeptHeads = async (req, res) => {
  try {
    const deptHeads = await Head.findAll();

    if (!deptHeads || deptHeads.length === 0) {
      return res.status(404).json({ message: "No department heads found" });
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

    console.log("user-headlogin", user);

    // Store user info in session
    req.session.user = {
      id: user.id,
      dept_name: user.department,
      dept_head_name: user.dept_head_name,
      email: user.email,
      token,
      refreshToken: user.refreshToken,
    };

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
    console.log("newuser", newuser);
    const id = newuser.id;

    const userdata = await DepartmentWallet.findOne({
      attributes: ["total_balance"],
      where: { department_id: id },
      order: [["id", "DESC"]],
    });

    const totalwallet = userdata.dataValues.total_balance;

    // Pass user data to the view 
    res.render("headdashboard", { newuser, totalwallet });
  } catch (error) {
    console.error("Error in Admindashboard:", error);
    return res.status(500).send("Internal Server Error");
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
    const id =await Head.findOne({
      attributes:["id"],
      where:{department:dept_to}
    })

    const dept_to_id = id.dataValues.id;

    //fetching total balance of departfrom 

    const deptFrom =await DepartmentWallet.findOne({
      attributes:["id","total_balance"],
      where:{department_id :dept_from_id },
      order:[["id","DESC"]]
    })

    console.log("deptFrom",deptFrom);

   let deptFrom_totalBalance = deptFrom.dataValues.total_balance || 0;
   let deptFrom_id = deptFrom.dataValues.id;

   //fetching total balance of department to  

   const deptTo =await DepartmentWallet.findOne({
    attributes:["id","total_balance"],
    where:{department_id :dept_to_id },
    order:[["id","DESC"]]
  })

 let deptTo_totalBalance = deptTo.dataValues.total_balance || 0;
 let deptTo_id = deptTo.dataValues.id;

 console.log("deptFrom_totalBalance",deptFrom_totalBalance);
 console.log("deptTo_totalBalance",deptTo_totalBalance);

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
     {total_balance : deptTo_totalBalance},
     { where:{id : deptTo_id}},
    )

    await DepartmentWallet.update(
      {total_balance : deptFrom_totalBalance},
      { where:{id : deptFrom_id}},
     )


    res.redirect("/headnewdashboard");
  } catch (err) {
    console.log("err in ProjectTransaction", err.message);
    return res.status(500).send({
      message: "Internal server error",
      err: err.message,
    });
  }
};
