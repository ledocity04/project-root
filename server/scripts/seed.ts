import { prisma } from "../src/db/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  await prisma.matchEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 10);
  const users = await prisma.user.createMany({
    data: [
      { username: "alice", passwordHash },
      { username: "bob", passwordHash },
      { username: "charlie", passwordHash },
    ],
  });
  console.log("Seeded users:", users.count);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
