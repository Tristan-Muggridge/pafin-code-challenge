import settings from "../appSettings";
import memoryDb from "./memoryDb";
import prismaDb from "./prismaDb";

export default () => settings.dbType === 'prisma' ? prismaDb : memoryDb;
