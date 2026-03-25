import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Busca un usuario por email
  const user = await prisma.user.findUnique({
    where: { email: "cffferic@gmail.com" }, // cambia por el correo que usas
  });

  console.log("Usuario encontrado:", user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });