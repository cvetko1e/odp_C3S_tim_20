import { PoolConnection } from "mysql2/promise";
import { DbNode } from "./DbNode";
import { NodeStatus } from "../../Domain/enums/NodeStatus";
import { HEALTH_CHECK_TIMEOUT, HEALTH_CHECK_INTERVAL_MS } from "../../Domain/constants/Constants";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

export interface NodeInfo {
    name: string;
    pool: { getConnection(): Promise<PoolConnection> };
    node: DbNode;
}

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

    public async runHealthCheck(master: NodeInfo, slaves: NodeInfo[]): Promise<void> {
        await Promise.all([master, ...slaves].map((n) => this.checkNode(n)));
        this.logger.info(
            "DB",
            [master, ...slaves]
                .map((n) => `${n.name}=${n.node.status}(${n.node.responseTimeMs}ms)`)
                .join(" | "),
        );
    }

    public startHealthCheck(master: NodeInfo, slaves: NodeInfo[]): void {
        if (this.healthTimer) return;
        this.healthTimer = setInterval(
            () => void this.runHealthCheck(master, slaves),
            HEALTH_CHECK_INTERVAL_MS,
        );
        this.logger.info("DB", `Health check started — interval ${HEALTH_CHECK_INTERVAL_MS}ms`);
    }

    public async init(master: NodeInfo, slaves: NodeInfo[]): Promise<void> {
        await this.runHealthCheck(master, slaves);
        this.startHealthCheck(master, slaves);
    }

    public stop(): void {
        if (this.healthTimer) clearInterval(this.healthTimer);
    }
}
