import { prisma } from "../lib/Client.js";
export const verifyAdmin = async (req, res, next) => {
  if (req.session.adminId) {
    try {
      const admin = await prisma.admins.findUnique({
        where: {
          uuid: req.session.adminId,
        },
      });
      if (admin) next();
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  } else {
    return res.status(401).json({ msg: "Akses Ditolak!" });
  }
};
export const verifyVoter = async (req, res, next) => {
  if (req.session.voterId) {
    try {
      const voter = await prisma.voters.findUnique({
        where: {
          uuid: req.session.voterId,
        },
      });
      if (voter) next();
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  } else {
    return res.status(401).json({ msg: "Akses Ditolak!" });
  }
};
