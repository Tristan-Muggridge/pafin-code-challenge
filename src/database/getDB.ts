import settings, { dbType } from "../appSettings";
import memoryDb from "./memoryDb";
import prismaDb from "./prismaDb";

export default () => settings.dbType === dbType.prisma ? prismaDb : memoryDb;
