import { prisma } from "../lib/Client.js";
export const handleConnection = (io, socket) => {
  socket.on("update", async () => {
    try {
      const count = await prisma.voters.count();
      const countNull = await prisma.voters.count({
        where: {
          candidatesId: null,
        },
      });
      const countNotNull = await prisma.voters.count({
        where: {
          candidatesId: {
            not: null,
          },
        },
      });
      const getCandidates = await prisma.candidates.findMany();
      const candidateWithVoters = Promise.all(
        getCandidates.map(async (candidate) => {
          try {
            const totalVoters = await prisma.voters.count({
              where: {
                candidatesId: candidate.id,
              },
            });
            return {
              candidateNama: candidate.nama,
              candidateKelas: candidate.kelas,
              candidateJurusan: candidate.jurusan,
              candidateVisi: candidate.visi,
              candidateMisi: candidate.misi,
              candidateSuara: totalVoters,
              candidateURL: candidate.url,
            };
          } catch (error) {
            return res.status(400).json({ msg: error.message });
          }
        })
      );
      const result = await candidateWithVoters;
      io.emit("dashboardUpdate", {
        count,
        countNotNull,
        countNull,
        result,
      });
    } catch (error) {
      console.error(error);
    }
  });
};
