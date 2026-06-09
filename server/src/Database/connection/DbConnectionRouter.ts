import { PoolConnection } from "mysql2/promise";
import { NodeStatus } from "../../Domain/enums/NodeStatus";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { NodeInfo } from "./DbHealthChecker";

export class DbConnectionRouter {
    private slaveRrIndex: number = 0;

    public constructor(private readonly logger: ILoggerService) { }

    public async getWriteConnection(
        master: NodeInfo,
    ): Promise<{ conn: PoolConnection; nodeName: string } | undefined> {
        if (master.node.status === NodeStatus.OFFLINE) {
            this.logger.error("DB", "Master is OFFLINE � write not possible");
            return undefined;
        }
        try {
            const conn = await master.pool.getConnection();
            master.node.successfulQueries++;
            return { conn, nodeName: master.name };
        } catch (err) {
            master.node.status = NodeStatus.OFFLINE;
            master.node.failedQueries++;
            this.logger.error("DB", "Failed to connect to master", err);
            return undefined;
        }
    }

    public async getReadConnection(
  master: NodeInfo,
  slaves: NodeInfo[],
): Promise<{ conn: PoolConnection; nodeName: string } | undefined> {
  const preferred = slaves.filter((s) => s.node.status === NodeStatus.HEALTHY);
  const fallback = slaves.filter((s) => s.node.status === NodeStatus.DEGRADED);
  const candidates = preferred.length > 0 ? preferred : fallback;

  for (let i = 0; i < candidates.length; i++) {
    const idx = (this.slaveRrIndex + i) % candidates.length;
    const info = candidates[idx];

    try {
      const conn = await info.pool.getConnection();
      this.slaveRrIndex = (idx + 1) % candidates.length;
      info.node.successfulQueries++;
      return { conn, nodeName: info.name };
    } catch {
      info.node.status = NodeStatus.OFFLINE;
      info.node.failedQueries++;
      this.logger.warn("DB", `Slave ${info.name} unreachable, trying next`);
    }
  }

  this.logger.warn("DB", "No usable slaves available — falling back to master for read");

  if (master.node.status === NodeStatus.OFFLINE) {
    this.logger.error("DB", "Master also offline — read not possible");
    return undefined;
  }

  try {
    const conn = await master.pool.getConnection();
    master.node.successfulQueries++;
    return { conn, nodeName: master.name };
  } catch (err) {
    master.node.status = NodeStatus.OFFLINE;
    this.logger.error("DB", "Failed to connect to master for fallback read", err);
    return undefined;
  }
}

    public getSlaveRrIndex(): number {
        return this.slaveRrIndex;
    }
}
