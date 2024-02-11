import express from "express";
import {
  isAdmin,
  loginAdmin,
  logoutAdmin,
} from "../controllers/AuthController.js";
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  deleteAllAdmins,
} from "../controllers/AdminsController.js";
import {
  getVoters,
  getVoterByNIS,
  createVoter,
  importVoters,
  updateVoter,
  deleteVoter,
  deleteAllVoters,
} from "../controllers/VotersController.js";
import {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  deleteAllCandidates,
} from "../controllers/CandidatesController.js";
import { verifyAdmin } from "../middlewares/AuthMiddleware.js";
const router = express.Router();
router.get("/admin", isAdmin);
router.post("/admin", loginAdmin);
router.delete("/admin", verifyAdmin, logoutAdmin);
router.get("/admin/staf", verifyAdmin, getAdmins);
router.get("/admin/staf/:id", verifyAdmin, getAdminById);
router.post("/admin/staf", verifyAdmin, createAdmin);
router.patch("/admin/staf/:id", verifyAdmin, updateAdmin);
router.delete("/admin/staf/:id", verifyAdmin, deleteAdmin);
router.delete("/admin/staf", verifyAdmin, deleteAllAdmins);
router.get("/admin/calon", verifyAdmin, getCandidates);
router.get("/admin/calon/:id", verifyAdmin, getCandidateById);
router.post("/admin/calon", verifyAdmin, createCandidate);
router.patch("/admin/calon/:id", verifyAdmin, updateCandidate);
router.delete("/admin/calon/:id", verifyAdmin, deleteCandidate);
router.delete("/admin/calon", verifyAdmin, deleteAllCandidates);
router.get("/admin/siswa", verifyAdmin, getVoters);
router.get("/admin/siswa/:nis", verifyAdmin, getVoterByNIS);
router.post("/admin/siswa", verifyAdmin, createVoter);
router.post("/admin/import", verifyAdmin, importVoters);
router.patch("/admin/siswa/:nis", verifyAdmin, updateVoter);
router.delete("/admin/siswa/:nis", verifyAdmin, deleteVoter);
router.delete("/admin/siswa", verifyAdmin, deleteAllVoters);
export default router;
