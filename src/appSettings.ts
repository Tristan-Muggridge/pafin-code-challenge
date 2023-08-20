export interface AppSettings {
    dbType: 'prisma' | 'memory',
    port: number
}

const settings: AppSettings = {
    dbType: 'memory',
    port: 3000
}

export default settings;