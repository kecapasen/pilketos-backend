import { prisma } from "../lib/Client.js";
import bcrypt from "bcrypt";
export const isAdmin = async (req, res) => {
  if (req.session.adminId) {
    try {
      const admin = await prisma.admins.findUnique({
        where: {
          uuid: req.session.adminId,
        },
      });
      if (admin) {
        return res
          .status(200)
          .json({ admin: true, nama: admin.nama, posisi: admin.posisi });
      } else {
        return res.status(200).json({ admin: false });
      }
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  } else {
    return res.status(200).json({ admin: false });
  }
};
export const isVoter = async (req, res) => {
  if (req.session.voterId) {
    try {
      const voter = await prisma.voters.findUnique({
        where: {
          uuid: req.session.voterId,
        },
      });
      if (voter) {
        return res.status(200).json({
          voter: true,
          nis: voter.nis,
          nama: voter.nama,
          kelas: voter.kelas,
          jurusan: voter.jurusan,
          candidateId: voter.candidatesId,
        });
      } else {
        return res.status(200).json({ voter: false });
      }
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  } else {
    return res.status(200).json({ voter: false });
  }
};
export const loginAdmin = async (req, res) => {
  try {
    const admin = await prisma.admins.findUnique({
      where: {
        nama: req.body.nama,
      },
    });
    if (!admin) return res.status(404).json({ msg: "Admin Tidak Ditemukan!" });
    const match = await bcrypt.compare(req.body.password, admin.password);
    if (!match) return res.status(400).json({ msg: "Password Salah!" });
    req.session.adminId = admin.uuid;
    return res
      .status(200)
      .json({ admin: true, nama: admin.nama, posisi: admin.posisi });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const logoutAdmin = (req, res) => {
  delete req.session.adminId;
  return res.status(200).json({ admin: false });
};
export const loginVoter = async (req, res) => {
  try {
    const voter = await prisma.voters.findUnique({
      where: {
        nis: Number(req.body.nis),
      },
    });
    if (!voter) return res.status(404).json({ msg: "Siswa Tidak Ditemukan!" });
    if (voter.candidatesId !== null)
      return res.status(403).json({ msg: "Anda Sudah Memilih!" });
    const match = voter.password === req.body.password;
    if (!match) return res.status(400).json({ msg: "Password Salah!" });
    req.session.voterId = voter.uuid;
    return res.status(200).json({
      voter: true,
      nis: voter.nis,
      nama: voter.nama,
      kelas: voter.kelas,
      jurusan: voter.jurusan,
      candidateId: voter.candidatesId,
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const logoutVoter = (req, res) => {
  delete req.session.voterId;
  return res.status(200).json({ voter: false });
};
