import express from "express";

import {
  AdminRegister,
  Admin_login,
  AdminLogin,
  saveDeptHead,
  getDeptHeads,
  Admindashboard,
  AdminLogout,
  Admin_Wallet,
  AdminWalletPage,
  getTotalWallet,
  PayDeptPage,
  // AddPaymentToDept,
  AddDeptWallet,
  AssignProjectPage,
  AssignProject,
  AssignedProjectList,
} from "../Controller/Admin_Cntrl.js";

import {
  addhead,
  head_login,
  HeadLogin,
  headnewdashboard,
  ProjectTransactionPage,
  ProjectTransaction,
  SalaryTransactionPage,
  SalaryTransactions,
  AdTransactionPage,
  AdTransaction,
} from "../Controller/Head_Controller.js";

import { isAuthenticated } from "../Middlewares/isAuthenticated.js"; // Adjust path if necessary

const router = express.Router();

// router.post("/addpayment/:id",AddPaymentToDept);

// Admin routes

router.get("/", Admin_login);
router.post("/add_admin", AdminRegister);
router.post("/adminlogin", AdminLogin);
router.post("/saveDeptHead", saveDeptHead);
router.get("/getDeptHeads", getDeptHeads);
router.get("/dashboard", isAuthenticated, Admindashboard);
router.get("/logout", AdminLogout);
router.post("/adminwallet", Admin_Wallet);
router.get("/wallet", AdminWalletPage);
router.get("/totalwallet", getTotalWallet);
router.get("/paydept/:id", PayDeptPage);
router.post("/adddeptwallet", AddDeptWallet);
router.get("/assign-project", AssignProjectPage);
router.post("/assign-project", AssignProject);
router.get("/project-list", AssignedProjectList);

// Department Head routes

router.post("/login_head", HeadLogin);
router.get("/headnewdashboard", headnewdashboard);
router.get("/headlogin", head_login);
router.get("/addhead", addhead);
router.get("/project-transaction", ProjectTransactionPage);
router.post("/project-transaction", ProjectTransaction);
router.get("/salary-transaction", SalaryTransactionPage);
router.post("/salary-transaction", SalaryTransactions);
router.get("/ad-transaction", AdTransactionPage);
router.post("/ad-transaction", AdTransaction);

export default router;
