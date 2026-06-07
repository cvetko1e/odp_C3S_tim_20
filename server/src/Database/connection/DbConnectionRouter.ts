import { PoolConnection } from "mysql2/promise";
import { NodeStatus } from "../../Domain/enums/NodeStatus";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { NodeInfo } from "./DbHealthChecker";

export class DbConnectionRouter {
    private slaveRrIndex: number = 0;

    public constructor(private readonly logger: ILoggerService) { }

    public async getWriteConnection(
        master: NodeInfo,
    ): Promise<{ conn: PoolConnection; nodeName: string } | null> {
        if (master.node.status === NodeStatus.OFFLINE) {
            this.logger.error("DB", "Master is OFFLINE - write not possible");
            return null;
        }
        try {
            const conn = await master.pool.getConnection();
            master.node.successfulQueries++;
            return { conn, nodeName: master.name };
        } catch (err) {
            master.node.status = NodeStatus.OFFLINE;
            master.node.failedQueries++;
            this.logger.error("DB", "Failed to connect to master", err);
            return null;
        }
    }

    public async getReadConnection(
        master: NodeInfo,
        slaves: NodeInfo[],
    ): Promise<{ conn: PoolConnection; nodeName: string } | null> {
        const healthy = slaves.filter((s) => s.node.status === NodeStatus.HEALTHY);
        const degraded = slaves.filter((s) => s.node.status === NodeStatus.DEGRADED);
        const candidates = healthy.length > 0 ? healthy : degraded;
        const n = candidates.length;

        for (let i = 0; i < n; i++) {
            const idx = (this.slaveRrIndex + i) % n;
            const info = candidates[idx];
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

        this.logger.warn("DB", "No usable slaves - falling back to master for read");
        if (master.node.status === NodeStatus.OFFLINE) {
            this.logger.error("DB", "Master also offline - read not possible");
            return null;
        }
        try {
            const conn = await master.pool.getConnection();
            master.node.successfulQueries++;
            return { conn, nodeName: master.name };
        } catch (err) {
            master.node.status = NodeStatus.OFFLINE;
            this.logger.error("DB", "Failed to connect to master for fallback read", err);
            return null;
        }
    }

    public getSlaveRrIndex(): number {
        return this.slaveRrIndex;
    }
}
