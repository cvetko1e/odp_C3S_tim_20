import mysql, { Pool } from "mysql2/promise";
import { HEALTH_CHECK_TIMEOUT } from "../../Domain/constants/Constants";

const DB_NAME = process.env.DB_NAME ?? "project_db";

export const masterPool: Pool = mysql.createPool({
    host: process.env.DB_MASTER_HOST ?? "localhost",
    port: parseInt(process.env.DB_MASTER_PORT ?? "3306", 10),
    user: process.env.DB_MASTER_USER ?? "root",
    password: process.env.DB_MASTER_PASSWORD ?? "",
    database: process.env.DB_MASTER_NAME ?? DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: HEALTH_CHECK_TIMEOUT,
});

export const slave1Pool: Pool = mysql.createPool({
    host: process.env.DB_SLAVE1_HOST ?? "localhost",
    port: parseInt(process.env.DB_SLAVE1_PORT ?? "3307", 10),
    user: process.env.DB_SLAVE1_USER ?? "root",
    password: process.env.DB_SLAVE1_PASSWORD ?? "",
    database: process.env.DB_SLAVE1_NAME ?? DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: HEALTH_CHECK_TIMEOUT,
});

export const slave2Pool: Pool = mysql.createPool({
    host: process.env.DB_SLAVE2_HOST ?? "localhost",
    port: parseInt(process.env.DB_SLAVE2_PORT ?? "3308", 10),
    user: process.env.DB_SLAVE2_USER ?? "root",
    password: process.env.DB_SLAVE2_PASSWORD ?? "",
    database: process.env.DB_SLAVE2_NAME ?? DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: HEALTH_CHECK_TIMEOUT,
});