import {Router} from "express"
import { createParty, getAllParties, getSingleParty,updateParty,deleteParty } from "../controllers/partymaster.controllers.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const  router = Router();

router.use(verifyJWT)

router.route("/createparty").post(createParty);
router.route("/getallparties").get(getAllParties);
router.route("/getallparty").get(getAllParties);
router.route("/getsingleparty/:id").get(getSingleParty);
router.route("/singleparty/:id").get(getSingleParty);
router.route("/updateparty/:id").patch(updateParty).put(updateParty).get(updateParty);
router.route("/deleteparty/:id").delete(deleteParty);

export default router;