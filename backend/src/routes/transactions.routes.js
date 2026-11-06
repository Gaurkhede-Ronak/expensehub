import { Router } from "express";
import { createTransaction, getAllTransactions, getSingleTransaction, updateTransaction, deleteTransaction } from "../controllers/transactions.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route("/createtransaction").post(createTransaction)
router.route("/getalltransactions").get(getAllTransactions)
router.route("/getalltransaction").get(getAllTransactions)
router.route("/getsingletransaction/:id").get(getSingleTransaction)
router.route("/singletransaction/:id").get(getSingleTransaction)
router.route("/updatetransaction/:id").patch(updateTransaction)
router.route("/deletetransaction/:id").delete(deleteTransaction)

export default router;