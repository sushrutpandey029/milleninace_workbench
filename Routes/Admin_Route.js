import express from "express";

import {
  AdminRegister,
  Admin_login,
  AdminLogin,
  Admindashboard,
  AdminLogout,
  Admin_Wallet,
  AdminWalletPage,
  getTotalWallet,
  PayDeptPage,
  // AddPaymentToDept,
  AddDeptWallet
} from "../Controller/Admin_Cntrl.js";

import {
  saveDeptHead,
  addhead,
  getDeptHeads,
  head_login,
  HeadLogin,
  headnewdashboard,
  ProjectTransactionPage,
  ProjectTransaction
} from "../Controller/Head_Controller.js";

import { isAuthenticated } from "../Middlewares/isAuthenticated.js"; // Adjust path if necessary

const router = express.Router();

router.get("/", Admin_login);

router.get("/headlogin", head_login);
router.get("/headnewdashboard", headnewdashboard);

router.post("/login_head", HeadLogin);

router.post("/add_admin", AdminRegister);

router.post("/adminlogin", AdminLogin);
router.post("/adminwallet",Admin_Wallet);
router.get("/wallet",AdminWalletPage);
router.get("/totalwallet",getTotalWallet);
router.get("/paydept/:id",PayDeptPage);
// router.post("/addpayment/:id",AddPaymentToDept);
router.post("/adddeptwallet",AddDeptWallet)

router.get("/dashboard", isAuthenticated, Admindashboard);
router.get("/logout", AdminLogout);

router.post("/saveDeptHead", saveDeptHead);
router.get("/addhead", addhead);
router.get("/getDeptHeads", getDeptHeads);

  // Admin



  // Department Head

  router.get("/project-transaction",ProjectTransactionPage)
  router.post("/project-transaction",ProjectTransaction)


export default router;
