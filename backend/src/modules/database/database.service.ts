import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: sql.ConnectionPool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const config: sql.config = {
      user: this.configService.get<string>('DB_USER') || 'sa',
      password: this.configService.get<string>('DB_PASSWORD') || '',
      server: this.configService.get<string>('DB_HOST') || 'localhost',
      database: this.configService.get<string>('DB_NAME') || 'ACOH_DB',
      port: parseInt(this.configService.get<string>('DB_PORT') || '1433', 10),
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    try {
      this.pool = await new sql.ConnectionPool(config).connect();
      this.logger.log('Connected to SQL Server successfully.');
    } catch (err) {
      this.logger.error('Failed to connect to SQL Server:', err);
    }
  }

  async query(queryText: string, params: { name: string; type: any; value: any }[] = []) {
    if (!this.pool) {
      throw new Error('Database connection is not initialized');
    }
    const request = this.pool.request();
    for (const param of params) {
      request.input(param.name, param.type, param.value);
    }
    return request.query(queryText);
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close();
      this.logger.log('Database connection pool closed.');
    }
  }
}
