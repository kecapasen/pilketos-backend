import { prisma } from "../lib/Client.js";
import multer from "multer";
import path from "path";
import xlsx from "xlsx";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./documents");
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
export const getVoters = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const offset = parseInt(limit * (page - 1));
  let totalRows;
  let totalPages;
  let result;
  try {
    const totalData = await prisma.voters.count();
    if (search === "" || search === null) {
      try {
        totalRows = await prisma.voters.count();
        totalPages = Math.ceil(totalRows / limit);
        result = await prisma.voters.findMany({
          skip: offset,
          take: limit,
          orderBy: [
            {
              kelas: "asc",
            },
            {
              jurusan: "asc",
            },
            {
              nama: "asc",
            },
          ],
          select: {
            nis: true,
            nama: true,
            kelas: true,
            jurusan: true,
            candidatesId: true,
          },
        });
      } catch (error) {
        return res.status(400).json({ msg: error.message });
      }
    } else {
      try {
        totalRows = await prisma.voters.count({
          where: {
            OR: [
              {
                nis: {
                  equals: parseInt(search) || 0,
                },
              },
              {
                nama: {
                  contains: search,
                },
              },
            ],
          },
        });
        totalPages = Math.ceil(totalRows / limit);
        result = await prisma.voters.findMany({
          where: {
            OR: [
              {
                nis: {
                  equals: parseInt(search) || 0,
                },
              },
              {
                nama: {
                  contains: search,
                },
              },
            ],
          },
          skip: offset,
          take: limit,
          orderBy: [
            {
              kelas: "asc",
            },
            {
              jurusan: "asc",
            },
            {
              nama: "asc",
            },
          ],
          select: {
            nis: true,
            nama: true,
            kelas: true,
            jurusan: true,
            candidatesId: true,
          },
        });
      } catch (error) {
        return res.status(400).json({ msg: error.message });
      }
    }
    return res.status(200).json({
      result,
      page,
      limit,
      offset,
      totalRows,
      totalPages,
      totalData,
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const getVoterByNIS = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const response = await prisma.voters.findUnique({
      where: {
        nis: Number(req.params.nis),
      },
      select: {
        nis: true,
        nama: true,
        password: true,
        kelas: true,
        jurusan: true,
        candidatesId: true,
      },
    });
    if (!response)
      return res.status(404).json({ msg: "Data Tidak Ditemukan!" });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const createVoter = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const { nis, nama, password, kelas, jurusan } = req.body;
    const isAlready = await prisma.voters.findUnique({
      where: {
        nis: Number(nis),
      },
    });
    if (isAlready) return res.status(400).json({ msg: "Data Sudah Ada!" });
    const response = await prisma.voters.create({
      data: {
        nis: Number(nis),
        nama,
        password,
        kelas,
        jurusan,
      },
    });
    return res.status(201).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const importVoters = async (req, res) => {
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
      const file = req.file;
      if (!file)
        return res.status(428).json({ msg: "Tidak Ada File yang Diupload!" });
      const ext = path.extname(file.originalname);
      const allowedType = [".xlsx"];
      if (!allowedType.includes(ext.toLowerCase()))
        return res.status(415).json({ msg: "Format File Invalid!" });
      const fileName = file.originalname;
      const filePath = `./documents/${fileName}`;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const range = xlsx.utils.decode_range(worksheet["!ref"]);
      const startRow = range.s.r + 2;
      const endRow = range.e.r + 1;
      for (let row = startRow; row <= endRow; row++) {
        const dataToSave = {
          nis: worksheet["A" + row] ? worksheet["A" + row].v : null,
          nama: worksheet["B" + row] ? worksheet["B" + row].v : null,
          password: worksheet["C" + row] ? worksheet["C" + row].v : null,
          kelas: worksheet["D" + row] ? worksheet["D" + row].v : null,
          jurusan: worksheet["E" + row] ? worksheet["E" + row].v : null,
        };
        try {
          await prisma.voters.create({
            data: dataToSave,
          });
        } catch (error) {
          return res.status(400).json({ msg: error.message });
        }
      }
      return res.status(201).json({ msg: "File Uploaded Successfully!" });
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const updateVoter = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const { nis, nama, password, kelas, jurusan } = req.body;
    const response = await prisma.voters.update({
      where: {
        nis: Number(req.params.nis),
      },
      data: {
        nis: Number(nis),
        nama,
        password,
        kelas,
        jurusan,
      },
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const updateVoterCandidate = async (req, res) => {
  const { nis } = req.body;
  try {
    await prisma.voters.update({
      where: {
        nis: Number(nis),
        AND: {
          candidatesId: null,
        },
      },
      data: {
        candidatesId: Number(req.params.candidateId),
      },
    });
    delete req.session.voterId;
    return res.status(200).json({ voter: false });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const deleteVoter = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const response = await prisma.voters.delete({
      where: {
        nis: Number(req.params.nis),
      },
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const deleteAllVoters = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const response = await prisma.voters.deleteMany();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
