import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { DbNode } from "./DbNode";
import { NodeStatus } from "../../Domain/enums/NodeStatus";
import { HEALTH_CHECK_TIMEOUT, HEALTH_CHECK_INTERVAL_MS, REPLICATION_LAG_DEGRADED_SECONDS } from "../../Domain/constants/Constants";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

export interface NodeInfo {
    name: string;
    pool: { getConnection(): Promise<PoolConnection> };
    node: DbNode;
}

type ReplicaStatusRow = RowDataPacket & {
    Replica_IO_Running?: string;
    Replica_SQL_Running?: string;
    Seconds_Behind_Source?: number | null;
    Slave_IO_Running?: string;
    Slave_SQL_Running?: string;
    Seconds_Behind_Master?: number | null;
};

export class DbHealthChecker {
    private healthTimer: NodeJS.Timeout | null = null;

    public constructor(private readonly logger: ILoggerService) { }

    public async checkNode(info: NodeInfo): Promise<void> {
        const start = Date.now();
        let conn: PoolConnection | null = null;
        try {
            conn = await info.pool.getConnection();
            await conn.query("SELECT 1");
            const ms = Date.now() - start;
            info.node.responseTimeMs = ms;
            info.node.status = ms > HEALTH_CHECK_TIMEOUT ? NodeStatus.DEGRADED : NodeStatus.HEALTHY;

            if (info.node.role === "slave") {
                await this.checkReplicaStatus(info, conn);
            }

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

    private async checkReplicaStatus(info: NodeInfo, conn: PoolConnection): Promise<void> {
        const [rows] = await conn.query<ReplicaStatusRow[]>("SHOW REPLICA STATUS");
        const status = rows[0];

        if (!status) {
            info.node.status = NodeStatus.OFFLINE;
            this.logger.warn("DB", `Slave ${info.name} has no replica status`);
            return;
        }

        const ioRunning = status.Replica_IO_Running ?? status.Slave_IO_Running;
        const sqlRunning = status.Replica_SQL_Running ?? status.Slave_SQL_Running;
        const lag = status.Seconds_Behind_Source ?? status.Seconds_Behind_Master;

        if (ioRunning !== "Yes" || sqlRunning !== "Yes") {
            info.node.status = NodeStatus.OFFLINE;
            this.logger.warn("DB", `Slave ${info.name} replication is not running`);
            return;
        }

        if (lag === null || lag === undefined || lag > REPLICATION_LAG_DEGRADED_SECONDS) {
            info.node.status = NodeStatus.DEGRADED;
        }
    }

    public async runHealthCheck(master: NodeInfo, slaves: NodeInfo[]): Promise<void> {
        await Promise.all([master, ...slaves].map((n) => this.checkNode(n)));
        this.logger.info(
            "DB",
            [master, ...slaves]
                .map((n) => `${n.name}=${n.node.status}(${n.node.responseTimeMs}ms)`)
                .join(" | "),
        );
    }

    public startHealthCheck(
        master: NodeInfo,
        slaves: NodeInfo[],
        afterCheck?: () => Promise<void>,
    ): void {
        if (this.healthTimer) return;
        this.healthTimer = setInterval(
            () => void (async () => {
                await this.runHealthCheck(master, slaves);
                if (afterCheck) await afterCheck();
            })(),
            HEALTH_CHECK_INTERVAL_MS,
        );
        this.logger.info("DB", `Health check started - interval ${HEALTH_CHECK_INTERVAL_MS}ms`);
    }

    public async init(
        master: NodeInfo,
        slaves: NodeInfo[],
        afterCheck?: () => Promise<void>,
    ): Promise<void> {
        await this.runHealthCheck(master, slaves);
        if (afterCheck) await afterCheck();
        this.startHealthCheck(master, slaves, afterCheck);
    }

    public stop(): void {
        if (this.healthTimer) clearInterval(this.healthTimer);
    }
}
