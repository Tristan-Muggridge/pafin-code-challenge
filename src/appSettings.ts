export interface AppSettings {
    dbType: 'prisma' | 'memory',
    port: number,
    jwtSecret: string,
    environment?: 'development' | 'testing' | 'production'
}

const settings: AppSettings = {
    dbType: 'memory',
    port: 3000,
    jwtSecret: 'replace-me',
    environment: 'development'
}

export default settings;