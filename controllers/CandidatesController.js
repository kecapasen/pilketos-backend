import { prisma } from "../lib/Client.js";
import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname;
    cb(null, fileName);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
export const getCandidates = async (req, res) => {
  try {
    const response = await prisma.candidates.findMany();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const getCandidateById = async (req, res) => {
  try {
    const response = await prisma.candidates.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    if (!response)
      return res.status(404).json({ msg: "Data Tidak Ditemukan!" });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const createCandidate = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    upload.single("file")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(428).json({ msg: "Tidak Ada File yang Diupload!" });
      } else if (err) {
        return res.status(500).json({ msg: "Terjadi Kesalahan Saat Upload!" });
      }
      const { nama, kelas, jurusan, visi, misi } = req.body;
      const ext = path.extname(req.file.originalname);
      const allowedType = [".png", ".jpg", ".jpeg"];
      if (!allowedType.includes(ext.toLowerCase()))
        return res.status(415).json({ msg: "Format File Invalid!" });
      const file = req.file.originalname;
      const url = `${req.protocol}://${req.get("host")}/${file}`;
      try {
        const response = await prisma.candidates.create({
          data: {
            nama,
            kelas,
            jurusan,
            visi,
            misi,
            file,
            url,
          },
        });
        return res.status(201).json(response);
      } catch (error) {
        return res.status(400).json({ msg: error.message });
      }
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const updateCandidate = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const candidate = await prisma.candidates.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    if (!candidate)
      return res.status(404).json({ msg: "Data Tidak Ditemukan!" });
    upload.single("file")(req, res, async (err) => {
      const { nama, kelas, jurusan, visi, misi } = req.body;
      if (err instanceof multer.MulterError) {
        return res.status(428).json({ msg: "Tidak Ada File yang Diupload!" });
      } else if (err) {
        return res.status(500).json({ msg: "Terjadi Kesalahan Saat Upload!" });
      } else if (!req.file) {
        try {
          const response = await prisma.candidates.update({
            where: {
              id: Number(req.params.id),
            },
            data: {
              nama,
              kelas,
              jurusan,
              visi,
              misi,
            },
          });
          return res.status(201).json(response);
        } catch (error) {
          return res.status(400).json({ msg: error.message });
        }
      } else if (req.file) {
        const ext = path.extname(req.file.originalname);
        const allowedType = [".png", ".jpg", ".jpeg"];
        if (!allowedType.includes(ext.toLowerCase()))
          return res.status(415).json({ msg: "Format File Invalid!" });
        const file = req.file.originalname;
        const url = `${req.protocol}://${req.get("host")}/${file}`;
        try {
          const response = await prisma.candidates.update({
            where: {
              id: Number(req.params.id),
            },
            data: {
              nama,
              kelas,
              jurusan,
              visi,
              misi,
              file,
              url,
            },
          });
          return res.status(201).json(response);
        } catch (error) {
          return res.status(400).json({ msg: error.message });
        }
      }
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const deleteCandidate = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const response = await prisma.candidates.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const deleteAllCandidates = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const response = await prisma.candidates.deleteMany();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
