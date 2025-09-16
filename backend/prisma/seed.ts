import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const pwd = await bcrypt.hash("123456", 10);
  const staff = await prisma.user.upsert({
    where: { email: "medico@clinic.com" },
    update: {},
    create: {
      name: "Dra. Joana",
      email: "medico@clinic.com",
      password: pwd,
      role: "STAFF",
      phone: "8499999-9999",
    },
  });
  await prisma.user.upsert({
    where: { email: "paciente@clinic.com" },
    update: {},
    create: {
      name: "José da Silva",
      email: "paciente@clinic.com",
      password: pwd,
      role: "PATIENT",
      cpf: "000.111.222-33",
    },
  });
  const now = new Date();
  now.setHours(now.getHours() + 24, 0, 0, 0);
  await prisma.appointment.create({
    data: {
      date: now,
      reason: "Check-up",
      location: "Clínica Central",
      patientId: (
        await prisma.user.findUniqueOrThrow({
          where: { email: "paciente@clinic.com" },
        })
      ).id,
      staffId: staff.id,
    },
  });
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
