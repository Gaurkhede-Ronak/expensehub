import {Router} from "express"
import { createBudget, getAllBudgets, getSingleBudget, updateBudget, deleteBudget } from "../controllers/budgets.controllers.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/createbudget").post(createBudget)
router.route("/getallbudgets").get(getAllBudgets)
router.route("/getallbudget").get(getAllBudgets)
router.route("/getsinglebudget/:id").get(getSingleBudget)
router.route("/singlebudget/:id").get(getSingleBudget)
router.route("/updatebudget/:id").patch(updateBudget)
router.route("/deletebudget/:id").delete(deleteBudget)


export default router;