import { PoolConnection } from "mysql2/promise";
import { DbNode } from "./DbNode";
import { NodeStatus } from "../../Domain/enums/NodeStatus";
import { HealthStatus, NodeHealthInfo } from "./HealthStatus";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { masterPool, slave1Pool, slave2Pool } from "./PoolConfig";
import { DbHealthChecker, NodeInfo } from "./DbHealthChecker";
import { DbConnectionRouter } from "./DbConnectionRouter";

export class DbManager {
    private master: NodeInfo;
    private slaves: NodeInfo[];
    private readonly startTime: Date = new Date();
    private readonly healthChecker: DbHealthChecker;
    private readonly router: DbConnectionRouter;
    private failoverInProgress = false;

    public constructor(private readonly logger: ILoggerService) {
        this.master = {
            name: "master",
            pool: masterPool,
            node: new DbNode("master", process.env.DB_MASTER_HOST ?? "localhost", parseInt(process.env.DB_MASTER_PORT ?? "3306", 10), "master"),
        };
        this.slaves = [
            {
                name: "slave1",
                pool: slave1Pool,
                node: new DbNode("slave1", process.env.DB_SLAVE1_HOST ?? "localhost", parseInt(process.env.DB_SLAVE1_PORT ?? "3307", 10), "slave"),
            },
            {
                name: "slave2",
                pool: slave2Pool,
                node: new DbNode("slave2", process.env.DB_SLAVE2_HOST ?? "localhost", parseInt(process.env.DB_SLAVE2_PORT ?? "3308", 10), "slave"),
            },
        ];
        this.healthChecker = new DbHealthChecker(logger);
        this.router = new DbConnectionRouter(logger);
    }

    // ── Init ──────────────────────────────────────────────────────

    public async init(): Promise<void> {
        await this.healthChecker.init(this.master, this.slaves, this.handleAutomaticFailover.bind(this));
    }

    public async runHealthCheck(): Promise<void> {
        await this.healthChecker.runHealthCheck(this.master, this.slaves);
        await this.handleAutomaticFailover();
    }

    public startHealthCheck(): void {
        this.healthChecker.startHealthCheck(this.master, this.slaves, this.handleAutomaticFailover.bind(this));
    }

    public stop(): void {
        this.healthChecker.stop();
    }

    // ── Connection Routing ────────────────────────────────────────

    public async getWriteConnection(): Promise<{ conn: PoolConnection; nodeName: string } | undefined> {
        return this.router.getWriteConnection(this.master);
    }

    public async getReadConnection(): Promise<{ conn: PoolConnection; nodeName: string } | undefined> {
        return this.router.getReadConnection(this.master, this.slaves);
    }

    public async getPrimaryReadConnection(): Promise<{ conn: PoolConnection; nodeName: string } | undefined> {
        return this.router.getWriteConnection(this.master);
    }

    private async handleAutomaticFailover(): Promise<void> {
        if (this.master.node.status !== NodeStatus.OFFLINE || this.failoverInProgress) return;

        this.failoverInProgress = true;
        try {
            this.logger.warn("DB", "Master is offline - starting automatic failover");
            const result = await this.promoteSlaveToMaster();
            if (!result.success) {
                this.logger.error("DB", `Automatic failover failed: ${result.message}`);
                return;
            }
            this.logger.warn("DB", `Automatic failover completed: ${result.message}`);
        } finally {
            this.failoverInProgress = false;
        }
    }

    // ── Health Status ─────────────────────────────────────────────

    public getHealthStatus(): HealthStatus {
        const allNodes = [this.master, ...this.slaves];
        const nodes: NodeHealthInfo[] = allNodes.map((n) => n.node.toJSON());

        const masterOk = this.master.node.status === NodeStatus.HEALTHY;
        const slavesOk = this.slaves.every((s) => s.node.status === NodeStatus.HEALTHY);
        const anySlaveOk = this.slaves.some((s) => s.node.status !== NodeStatus.OFFLINE);

        let status: HealthStatus["status"];
        if (masterOk && slavesOk) status = "healthy";
        else if (masterOk && anySlaveOk) status = "degraded";
        else if (!masterOk) status = "unhealthy";
        else status = "degraded";

        return {
            status,
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
            nodes,
        };
    }

    // ── Failover ──────────────────────────────────────────────────

    public async promoteSlaveToMaster(): Promise<{
        success: boolean;
        message: string;
        promotedNode?: string;
        previousMaster?: string;
    }> {
        let candidateIndex = this.slaves.findIndex((s) => s.node.status === NodeStatus.HEALTHY);
        if (candidateIndex === -1) {
            candidateIndex = this.slaves.findIndex((s) => s.node.status === NodeStatus.DEGRADED);
        }
        if (candidateIndex === -1) {
            return { success: false, message: "No healthy slave available for promotion" };
        }

        const oldMaster = this.master;
        const promoted = this.slaves[candidateIndex];
        const previousMaster = oldMaster.name;
        const previousMasterHost = oldMaster.node.host;
        const previousMasterPort = oldMaster.node.port;

        const promotedReady = await this.preparePromotedMaster(promoted);
        if (!promotedReady) {
            return { success: false, message: `Failed to promote '${promoted.name}' for writes` };
        }

        await this.demotePreviousMaster(oldMaster);

        promoted.node.role = "master";
        oldMaster.node.role = "slave";

        this.master = promoted;
        this.slaves[candidateIndex] = oldMaster;

        this.logger.warn("DB", `FAILOVER: ${promoted.name} promoted to master, ${previousMaster} demoted to slave`);

        await this.logFailoverAudit(promoted.name, previousMaster, previousMasterHost, previousMasterPort);

        return {
            success: true,
            message: `Slave '${promoted.name}' promoted to master. Previous master '${previousMaster}' demoted.`,
            promotedNode: promoted.name,
            previousMaster,
        };
    }

    private async preparePromotedMaster(promoted: NodeInfo): Promise<boolean> {
        let conn: PoolConnection | null = null;
        try {
            conn = await promoted.pool.getConnection();
            await conn.query("STOP REPLICA");
            await conn.query("RESET REPLICA ALL");
            try {
                await conn.query("SET GLOBAL super_read_only = OFF");
            } catch {
                this.logger.warn("DB", `Node ${promoted.name} does not support super_read_only or it is already disabled`);
            }
            await conn.query("SET GLOBAL read_only = OFF");
            return true;
        } catch (err) {
            this.logger.error("DB", `Failed to prepare promoted master ${promoted.name}`, err);
            return false;
        } finally {
            if (conn) conn.release();
        }
    }

    private async demotePreviousMaster(previousMaster: NodeInfo): Promise<void> {
        let conn: PoolConnection | null = null;
        try {
            conn = await previousMaster.pool.getConnection();
            try {
                await conn.query("SET GLOBAL super_read_only = ON");
            } catch {
                this.logger.warn("DB", `Node ${previousMaster.name} does not support super_read_only`);
            }
            await conn.query("SET GLOBAL read_only = ON");
        } catch (err) {
            this.logger.warn("DB", `Previous master ${previousMaster.name} could not be set read-only: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            if (conn) conn.release();
        }
    }

    private async logFailoverAudit(
        promotedName: string,
        previousMaster: string,
        prevHost: string,
        prevPort: number,
    ): Promise<void> {
        let conn: PoolConnection | null = null;
        try {
            conn = await this.master.pool.getConnection();
            await conn.execute(
                `INSERT INTO audits (userId, action, entity, meta, createdAt) VALUES (NULL, ?, ?, ?, NOW())`,
                [
                    "FAILOVER",
                    "db_node",
                    JSON.stringify({ promotedNode: promotedName, previousMaster, previousHost: prevHost, previousPort: prevPort, timestamp: new Date().toISOString() }),
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
    public getSlaveRrIndex(): number { return this.router.getSlaveRrIndex(); }
}
