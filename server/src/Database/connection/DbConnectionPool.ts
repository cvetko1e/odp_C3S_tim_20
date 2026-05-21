import mysql, { Pool, PoolConnection } from "mysql2/promise";
import dotenv from "dotenv";
import { DbNode } from "./DbNode";
import { NodeStatus } from "../../Domain/enums/NodeStatus";
import { HealthStatus, NodeHealthInfo } from "./HealthStatus";
import { HEALTH_CHECK_TIMEOUT, HEALTH_CHECK_INTERVAL_MS } from "../../Domain/constants/Constants";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

dotenv.config();

const DB_NAME = process.env.DB_NAME ?? "project_db";

const masterPool: Pool = mysql.createPool({
  host:     process.env.DB_MASTER_HOST     ?? "localhost",
  port:     parseInt(process.env.DB_MASTER_PORT ?? "3306", 10),
  user:     process.env.DB_MASTER_USER     ?? "root",
  password: process.env.DB_MASTER_PASSWORD ?? "",
  database: process.env.DB_MASTER_NAME     ?? DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: HEALTH_CHECK_TIMEOUT,
});

const slave1Pool: Pool = mysql.createPool({
  host:     process.env.DB_SLAVE1_HOST     ?? "localhost",
  port:     parseInt(process.env.DB_SLAVE1_PORT ?? "3307", 10),
  user:     process.env.DB_SLAVE1_USER     ?? "root",
  password: process.env.DB_SLAVE1_PASSWORD ?? "",
  database: process.env.DB_SLAVE1_NAME     ?? DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: HEALTH_CHECK_TIMEOUT,
});

const slave2Pool: Pool = mysql.createPool({
  host:     process.env.DB_SLAVE2_HOST     ?? "localhost",
  port:     parseInt(process.env.DB_SLAVE2_PORT ?? "3308", 10),
  user:     process.env.DB_SLAVE2_USER     ?? "root",
  password: process.env.DB_SLAVE2_PASSWORD ?? "",
  database: process.env.DB_SLAVE2_NAME     ?? DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: HEALTH_CHECK_TIMEOUT,
});

interface NodeInfo { name: string; pool: Pool; node: DbNode; }

export class DbManager {
  private readonly master: NodeInfo;
  private readonly slaves: NodeInfo[];
  private slaveRrIndex: number = 0;
  private healthTimer: NodeJS.Timeout | null = null;
  private readonly startTime: Date = new Date();

  public constructor(private readonly logger: ILoggerService) {
    this.master = {
      name: "master", pool: masterPool,
      node: new DbNode("master", process.env.DB_MASTER_HOST ?? "localhost", parseInt(process.env.DB_MASTER_PORT ?? "3306", 10), "master"),
    };
    this.slaves = [
      { name: "slave1", pool: slave1Pool, node: new DbNode("slave1", process.env.DB_SLAVE1_HOST ?? "localhost", parseInt(process.env.DB_SLAVE1_PORT ?? "3307", 10), "slave") },
      { name: "slave2", pool: slave2Pool, node: new DbNode("slave2", process.env.DB_SLAVE2_HOST ?? "localhost", parseInt(process.env.DB_SLAVE2_PORT ?? "3308", 10), "slave") },
    ];
  }

  // ── Health Check ──────────────────────────────────────────────

  /** Pings a single node with SELECT 1 and measures response time */
  private async checkNode(info: NodeInfo): Promise<void> {
    const start = Date.now();
    let conn: PoolConnection | null = null;
    try {
      conn = await info.pool.getConnection();
      await conn.query("SELECT 1");
      const ms = Date.now() - start;
      info.node.responseTimeMs = ms;
      info.node.status = ms > HEALTH_CHECK_TIMEOUT ? NodeStatus.DEGRADED : NodeStatus.HEALTHY;
      info.node.successfulQueries++;
    } catch {
      info.node.status = NodeStatus.OFFLINE;
      info.node.responseTimeMs = -1;
      info.node.failedQueries++;
      this.logger.warn("DB", `Node ${info.name} failed health check`);
    } finally {
      if (conn) conn.release();
      info.node.lastCheck = new Date();
    }
  }

  /** Runs health check on all nodes */
  public async runHealthCheck(): Promise<void> {
    await Promise.all([this.master, ...this.slaves].map((n) => this.checkNode(n)));
    this.logger.info(
      "DB",
      [this.master, ...this.slaves]
        .map((n) => `${n.name}=${n.node.status}(${n.node.responseTimeMs}ms)`)
        .join(" | "),
    );
  }

  /** Starts the periodic health check (every HEALTH_CHECK_INTERVAL_MS) */
  public startHealthCheck(): void {
    if (this.healthTimer) return;
    this.healthTimer = setInterval(() => void this.runHealthCheck(), HEALTH_CHECK_INTERVAL_MS);
    this.logger.info("DB", `Health check started — interval ${HEALTH_CHECK_INTERVAL_MS}ms`);
  }

  /** Runs initial health check and starts the periodic timer */
  public async init(): Promise<void> {
    await this.runHealthCheck();
    this.startHealthCheck();
  }

  // ── Connection Routing ────────────────────────────────────────

  /** All writes (INSERT/UPDATE/DELETE) → Master only.
   *  Returns null when master is offline (caller should respond 503). */
  public async getWriteConnection(): Promise<{ conn: PoolConnection; nodeName: string } | null> {
    if (this.master.node.status === NodeStatus.OFFLINE) {
      this.logger.error("DB", "Master is OFFLINE — write not possible");
      return null;
    }
    try {
      const conn = await this.master.pool.getConnection();
      this.master.node.successfulQueries++;
      return { conn, nodeName: this.master.name };
    } catch (err) {
      this.master.node.status = NodeStatus.OFFLINE;
      this.master.node.failedQueries++;
      this.logger.error("DB", "Failed to connect to master", err);
      return null;
    }
  }

  /** All reads (SELECT) → Round-Robin across healthy slaves, fallback to Master */
  public async getReadConnection(): Promise<{ conn: PoolConnection; nodeName: string } | null> {
    const n = this.slaves.length;
    for (let i = 0; i < n; i++) {
      const idx = (this.slaveRrIndex + i) % n;
      const info = this.slaves[idx];
      if (info.node.status === NodeStatus.OFFLINE) continue;
      try {
        const conn = await info.pool.getConnection();
        this.slaveRrIndex = (idx + 1) % n;
        info.node.successfulQueries++;
        return { conn, nodeName: info.name };
      } catch {
        info.node.status = NodeStatus.OFFLINE;
        info.node.failedQueries++;
        this.logger.warn("DB", `Slave ${info.name} unreachable, trying next`);
      }
    }
    // Fallback to master
    this.logger.warn("DB", "All slaves offline — falling back to master for read");
    if (this.master.node.status === NodeStatus.OFFLINE) {
      this.logger.error("DB", "Master also offline — read not possible");
      return null;
    }
    try {
      const conn = await this.master.pool.getConnection();
      this.master.node.successfulQueries++;
      return { conn, nodeName: this.master.name };
    } catch (err) {
      this.master.node.status = NodeStatus.OFFLINE;
      this.logger.error("DB", "Failed to connect to master for fallback read", err);
      return null;
    }
  }

  // ── Health Status & Failover ──────────────────────────────────

  /** Returns structured health overview of all nodes */
  public getHealthStatus(): HealthStatus {
    const allNodes = [this.master, ...this.slaves];
    const nodes: NodeHealthInfo[] = allNodes.map((n) => n.node.toJSON() as unknown as NodeHealthInfo);

    const masterOk   = this.master.node.status === NodeStatus.HEALTHY;
    const slavesOk   = this.slaves.every((s) => s.node.status === NodeStatus.HEALTHY);
    const anySlaveOk = this.slaves.some((s) => s.node.status !== NodeStatus.OFFLINE);

    let status: HealthStatus["status"];
    if (masterOk && slavesOk) {
      status = "healthy";
    } else if (masterOk && anySlaveOk) {
      status = "degraded";
    } else if (!masterOk) {
      status = "unhealthy";
    } else {
      status = "degraded";
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime:    Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      nodes,
    };
  }

  /** Application-level failover: promotes first healthy slave to act as master.
   *  Logs the event into the audits table. */
  public async promoteSlaveToMaster(): Promise<{
    success: boolean;
    message: string;
    promotedNode?: string;
    previousMaster?: string;
  }> {
    // Find a healthy slave to promote
    const candidate = this.slaves.find((s) => s.node.status !== NodeStatus.OFFLINE);
    if (!candidate) {
      return { success: false, message: "No healthy slave available for promotion" };
    }

    const previousMaster = this.master.name;
    const previousMasterHost = this.master.node.host;
    const previousMasterPort = this.master.node.port;

    // Swap: promoted slave becomes the master pool
    const oldMasterPool = this.master.pool;
    const oldMasterNode = this.master.node;

    // Promote: copy slave's pool into master slot
    this.master.pool = candidate.pool;
    this.master.node.status = candidate.node.status;
    this.master.node.responseTimeMs = candidate.node.responseTimeMs;
    this.master.name = candidate.name;
    // Update the node's role
    candidate.node.role = "master";

    // Demote: old master becomes a slave in the candidate's slot
    candidate.pool = oldMasterPool;
    candidate.node.role = "slave";
    candidate.node.status = oldMasterNode.status;
    candidate.name = previousMaster;

    this.logger.warn("DB", `FAILOVER: ${candidate.node.name} promoted to master, ${previousMaster} demoted to slave`);

    // Log failover to audit_log
    await this.logFailoverAudit(candidate.node.name, previousMaster, previousMasterHost, previousMasterPort);

    return {
      success: true,
      message: `Slave '${candidate.node.name}' promoted to master. Previous master '${previousMaster}' demoted.`,
      promotedNode: candidate.node.name,
      previousMaster,
    };
  }

  /** Writes failover event into the audits table on the new master */
  private async logFailoverAudit(promotedName: string, previousMaster: string, prevHost: string, prevPort: number): Promise<void> {
    let conn: PoolConnection | null = null;
    try {
      conn = await this.master.pool.getConnection();
      await conn.execute(
        `INSERT INTO audits (userId, action, entity, meta, createdAt)
         VALUES (NULL, ?, ?, ?, NOW())`,
        [
          "FAILOVER",
          "db_node",
          JSON.stringify({
            promotedNode:  promotedName,
            previousMaster,
            previousHost:  prevHost,
            previousPort:  prevPort,
            timestamp:     new Date().toISOString(),
          }),
        ],
      );
      this.logger.info("DB", "Failover event recorded in audit_log");
    } catch (err) {
      this.logger.error("DB", "Failed to write failover audit", err);
    } finally {
      if (conn) conn.release();
    }
  }

  // ── Accessors ─────────────────────────────────────────────────

  public getNodes(): DbNode[] { return [this.master.node, ...this.slaves.map((s) => s.node)]; }
  public getSlaveRrIndex(): number { return this.slaveRrIndex; }
  public stop(): void { if (this.healthTimer) clearInterval(this.healthTimer); }
}
