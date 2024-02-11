import { prisma } from "../lib/Client.js";
import bcrypt from "bcrypt";
export const getAdmins = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const offset = parseInt(limit * (page - 1));
  let totalRows;
  let totalPages;
  let result;
  try {
    const totalData = await prisma.admins.count({
      where: {
        AND: [
          {
            NOT: {
              uuid: req.session.adminId,
            },
          },
          {
            NOT: {
              posisi: "Developer",
            },
          },
        ],
      },
    });
    if (search === "" || search === null) {
      try {
        totalRows = await prisma.admins.count({
          where: {
            AND: [
              {
                NOT: {
                  uuid: req.session.adminId,
                },
              },
              {
                NOT: {
                  posisi: "Developer",
                },
              },
            ],
          },
        });
        totalPages = Math.ceil(totalRows / limit);
        result = await prisma.admins.findMany({
          skip: offset,
          take: limit,
          where: {
            AND: [
              {
                NOT: {
                  uuid: req.session.adminId,
                },
              },
              {
                NOT: {
                  posisi: "Developer",
                },
              },
            ],
          },
          orderBy: [
            {
              nama: "asc",
            },
            {
              posisi: "asc",
            },
          ],
          select: {
            id: true,
            nama: true,
            posisi: true,
          },
        });
      } catch (error) {
        return res.status(400).json({ msg: error.message });
      }
    } else {
      try {
        totalRows = await prisma.admins.count({
          where: {
            AND: [
              {
                nama: {
                  contains: search,
                },
              },
              {
                AND: [
                  {
                    NOT: {
                      uuid: req.session.adminId,
                    },
                  },
                  {
                    NOT: {
                      posisi: "Developer",
                    },
                  },
                ],
              },
            ],
          },
        });
        totalPages = Math.ceil(totalRows / limit);
        result = await prisma.admins.findMany({
          where: {
            AND: [
              {
                nama: {
                  contains: search,
                },
              },
              {
                AND: [
                  {
                    NOT: {
                      uuid: req.session.adminId,
                    },
                  },
                  {
                    NOT: {
                      posisi: "Developer",
                    },
                  },
                ],
              },
            ],
          },
          skip: offset,
          take: limit,
          orderBy: [
            {
              nama: "asc",
            },
            {
              posisi: "asc",
            },
          ],
          select: {
            id: true,
            nama: true,
            posisi: true,
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
export const getAdminById = async (req, res) => {
  try {
    const response = await prisma.admins.findUnique({
      select: {
        id: true,
        nama: true,
        posisi: true,
      },
      where: {
        id: Number(req.params.id),
        NOT: {
          posisi: "Developer",
        },
      },
    });
    if (!response)
      return res.status(404).json({ msg: "Data Tidak Ditemukan!" });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const createAdmin = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const { nama, password, posisi } = req.body;
    if (posisi === "Developer" && auth.posisi !== "Developer")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const isAlready = await prisma.admins.findUnique({
      where: {
        nama,
      },
    });
    if (isAlready) return res.status(400).json({ msg: "Data Sudah Ada!" });
    bcrypt.hash(password, 10, async (error, hash) => {
      if (error) return res.status(400).json({ msg: error.message });
      try {
        const response = await prisma.admins.create({
          data: {
            nama,
            password: hash,
            posisi,
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
export const updateAdmin = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const response = await prisma.admins.findUnique({
      where: {
        id: Number(req.params.id),
        NOT: {
          posisi: "Developer",
        },
      },
    });
    if (!response)
      return res.status(404).json({ msg: "Data Tidak Ditemukan!" });
    if (auth.id === Number(req.params.id))
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const { nama, posisi } = req.body;
    if (posisi === "Developer" && auth.posisi !== "Developer")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    if (req.body.password) {
      const { password } = req.body;
      bcrypt.hash(password, 10, async (error, hash) => {
        if (error) return res.status(400).json({ msg: error.message });
        try {
          const response = await prisma.admins.update({
            where: {
              id: Number(req.params.id),
              NOT: {
                posisi: "Developer",
              },
            },
            data: {
              nama,
              password: hash,
              posisi,
            },
          });
          return res.status(200).json(response);
        } catch (error) {
          return res.status(400).json({ msg: error.message });
        }
      });
    } else {
      try {
        const response = await prisma.admins.update({
          where: {
            id: Number(req.params.id),
            NOT: {
              posisi: "Developer",
            },
          },
          data: {
            nama,
            posisi,
          },
        });
        return res.status(200).json(response);
      } catch (error) {
        return res.status(400).json({ msg: error.message });
      }
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const deleteAdmin = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const response = await prisma.admins.delete({
      where: {
        id: Number(req.params.id),
        NOT: {
          posisi: "Developer",
        },
      },
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
export const deleteAllAdmins = async (req, res) => {
  try {
    const auth = await prisma.admins.findUnique({
      where: {
        uuid: req.session.adminId,
      },
    });
    if (auth.posisi === "Pengawas")
      return res.status(403).json({ msg: "Akses Ditolak!" });
    const response = await prisma.admins.deleteMany({
      where: {
        NOT: [
          {
            posisi: "Developer",
          },
          {
            uuid: req.session.adminId,
          },
        ],
      },
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
