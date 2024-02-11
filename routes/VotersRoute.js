import express from "express";
import {
  isVoter,
  loginVoter,
  logoutVoter,
} from "../controllers/AuthController.js";
import {
  getCandidates,
  getCandidateById,
} from "../controllers/CandidatesController.js";
import { verifyVoter } from "../middlewares/AuthMiddleware.js";
import { updateVoterCandidate } from "../controllers/VotersController.js";
const router = express.Router();
router.get("/", isVoter);
router.post("/", loginVoter);
router.delete("/", logoutVoter);
router.get("/calon/", verifyVoter, getCandidates);
router.get("/calon/:id", verifyVoter, getCandidateById);
router.patch("/calon/:candidateId", verifyVoter, updateVoterCandidate);
export default router;
