import { NodeStatus } from "../../Domain/enums/NodeStatus";

export type NodeRole = "master" | "slave";

export class DbNode {
  public status: NodeStatus       = NodeStatus.OFFLINE;
  public lastCheck: Date          = new Date();
  public responseTimeMs: number   = -1;
  public successfulQueries: number = 0;
  public failedQueries: number    = 0;

  constructor(
    public readonly name: string,
    public readonly host: string,
    public readonly port: number,
    public role: NodeRole = "slave",
  ) {}

  /** Serialise for the health API response */
  public toJSON(): Record<string, unknown> {
    return {
      name:              this.name,
      role:              this.role,
      host:              this.host,
      port:              this.port,
      status:            this.status,
      responseTimeMs:    this.responseTimeMs,
      lastCheck:         this.lastCheck.toISOString(),
      successfulQueries: this.successfulQueries,
      failedQueries:     this.failedQueries,
    };
  }
}
