import dotenv from 'dotenv';
dotenv.config();

enum dbType {
    memory = 'memory',
    prisma = 'prisma'
}

enum environments {
    development = 'development',
    testing = 'testing',
    production = 'production'
}

export interface AppSettings {
    dbType: dbType | keyof typeof dbType,
    port: number,
    jwtSecret: string,
    environment?: environments | keyof typeof environments
}

process.env.DB_TYPE ??= 'memory';
process.env.PORT ??= '3000';
process.env.JWT_SECRET ??= '秘密'; // Could also use 1084c6809fb18415e32d4d390b2a5f7ff4cb2cffb74bef72d283de6b5a6f5c7b
process.env.ENVIRONMENT ??= 'development';

// Default to memory if the DB_TYPE is invalid (ie: not in the enum)
if (Object.keys(dbType).includes(process.env.DB_TYPE as string) === false) process.env.DB_TYPE = 'memory';

// Default to development if the ENVIRONMENT is invalid (ie: not in the enum)
if (Object.keys(environments).includes(process.env.ENVIRONMENT as string) === false) process.env.ENVIRONMENT = 'development';

const settings: AppSettings = {
    dbType: process.env.DB_TYPE ? process.env.DB_TYPE as dbType : dbType.memory,
    port: parseInt(process.env.PORT as string),
    jwtSecret: process.env.JWT_SECRET as string,
    environment: process.env.ENVIRONMENT as environments
}

export default settings;