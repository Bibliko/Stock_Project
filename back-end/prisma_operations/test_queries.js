// @flow

type hello = {
  text: string
};

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

console.log("Hello");

// console.log(dmmf.schema.inputTypes);
prisma.user.create({
  data: {
    id: 3
  }
});

const testfunc = (a: string, b: string): string => {
  return a + b;
};

testfunc("2", 4);
prisma.user.update({
  where: {
    email: "hello@gmail.com"
  },
  data: {
    firstName: "yoooo"
  },
  select: {}
});
