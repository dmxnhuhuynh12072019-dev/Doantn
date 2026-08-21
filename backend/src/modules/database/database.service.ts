import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: sql.ConnectionPool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  private getSqlConfig(): sql.config {
    const rawHost = this.configService.get<string>('DB_HOST') || '127.0.0.1';
    const serverHost = rawHost === 'localhost' ? '127.0.0.1' : rawHost;
    const timeout = parseInt(this.configService.get<string>('DB_REQUEST_TIMEOUT') || '60000', 10);

    return {
      user: this.configService.get<string>('DB_USER') || 'sa',
      password: this.configService.get<string>('DB_PASSWORD') || '123456',
      server: serverHost,
      database: this.configService.get<string>('DB_NAME') || 'ACOH_DB',
      port: parseInt(this.configService.get<string>('DB_PORT') || '1433', 10),
      connectionTimeout: 60000,
      requestTimeout: timeout,
      pool: {
        max: 25,
        min: 2,
        idleTimeoutMillis: 30000,
      },
      options: {
        encrypt: false,
        trustServerCertificate: true,
        cryptoCredentialsDetails: { minVersion: 'TLSv1' },
        requestTimeout: timeout,
        cancelTimeout: 30000,
        enableArithAbort: true,
        connectTimeout: 60000,
      },
    };
  }

  async onModuleInit() {
    const config = this.getSqlConfig();

    try {
      this.pool = await new sql.ConnectionPool(config).connect();
      this.logger.log('Connected to SQL Server successfully (127.0.0.1:1433).');
      
      // === AUTO-MIGRATION DỮ LIỆU MODULE 1: ZALO ZNS & SMS ===
      const migrations = [
        {
          name: 'Add ReceiveZaloNotif to Users',
          sql: `
            IF NOT EXISTS (
              SELECT 1 FROM sys.columns 
              WHERE (object_id = OBJECT_ID('Users') OR object_id = OBJECT_ID('dbo.Users')) 
              AND name = 'ReceiveZaloNotif'
            )
            BEGIN
                ALTER TABLE Users ADD ReceiveZaloNotif BIT NOT NULL DEFAULT 1;
            END;
          `,
        },
        {
          name: 'Add ReceiveSmsNotif to Users',
          sql: `
            IF NOT EXISTS (
              SELECT 1 FROM sys.columns 
              WHERE (object_id = OBJECT_ID('Users') OR object_id = OBJECT_ID('dbo.Users')) 
              AND name = 'ReceiveSmsNotif'
            )
            BEGIN
                ALTER TABLE Users ADD ReceiveSmsNotif BIT NOT NULL DEFAULT 1;
            END;
          `,
        },
        {
          name: 'Add ZaloPhoneNumber to Users',
          sql: `
            IF NOT EXISTS (
              SELECT 1 FROM sys.columns 
              WHERE (object_id = OBJECT_ID('Users') OR object_id = OBJECT_ID('dbo.Users')) 
              AND name = 'ZaloPhoneNumber'
            )
            BEGIN
                ALTER TABLE Users ADD ZaloPhoneNumber VARCHAR(15) NULL;
            END;
          `,
        },
        {
          name: 'Create NotificationLogs table',
          sql: `
            IF OBJECT_ID('NotificationLogs', 'U') IS NULL
            BEGIN
                CREATE TABLE NotificationLogs (
                    LogID INT IDENTITY(1,1) PRIMARY KEY,
                    UserID INT NOT NULL,
                    Channel VARCHAR(20) NOT NULL,
                    Recipient VARCHAR(100) NOT NULL,
                    Title NVARCHAR(200) NULL,
                    Message NVARCHAR(MAX) NOT NULL,
                    Status NVARCHAR(30) NOT NULL,
                    ErrorMessage NVARCHAR(MAX) NULL,
                    SentAt DATETIME NOT NULL DEFAULT GETDATE(),
                    CONSTRAINT FK_NotificationLogs_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
                );
            END;
          `,
        },
        {
          name: 'Update CHK_Notifications_Type constraint',
          sql: `
            IF EXISTS (
              SELECT 1 FROM sys.check_constraints 
              WHERE parent_object_id = OBJECT_ID('Notifications') 
                AND name = 'CHK_Notifications_Type' 
                AND LOWER(definition) NOT LIKE '%zalozns%'
            )
            BEGIN
                ALTER TABLE Notifications DROP CONSTRAINT CHK_Notifications_Type;
                ALTER TABLE Notifications ADD CONSTRAINT CHK_Notifications_Type CHECK (NotificationType IN ('Email', 'InApp', 'ZaloZNS', 'SMS', 'All'));
            END
            ELSE IF NOT EXISTS (
              SELECT 1 FROM sys.check_constraints 
              WHERE parent_object_id = OBJECT_ID('Notifications') 
                AND name = 'CHK_Notifications_Type'
            )
            BEGIN
                ALTER TABLE Notifications ADD CONSTRAINT CHK_Notifications_Type CHECK (NotificationType IN ('Email', 'InApp', 'ZaloZNS', 'SMS', 'All'));
            END;
          `,
        },
      ];

      for (const m of migrations) {
        try {
          await this.pool.request().query(m.sql);
          this.logger.log(`Auto-migration [${m.name}] hoàn tất.`);
        } catch (migErr) {
          this.logger.error(`Lỗi Auto-migration [${m.name}]: ${migErr.message}`);
        }
      }
    } catch (err) {
      this.logger.error('Failed to connect to SQL Server:', err);
    }
  }

  private async ensureConnected() {
    if (!this.pool || !this.pool.connected) {
      const config = this.getSqlConfig();
      this.logger.log('Re-initializing SQL Server connection pool...');
      try {
        if (this.pool) {
          try { await this.pool.close(); } catch (e) {}
        }
        this.pool = await new sql.ConnectionPool(config).connect();
      } catch (err) {
        this.logger.error('Re-initialization of ConnectionPool failed:', err?.message || err);
      }
    }
  }

  async query(queryText: string, params: { name: string; type: any; value: any }[] = []) {
    if (!this.pool || !this.pool.connected) {
      await this.ensureConnected();
    }

    try {
      const request = this.pool.request();
      for (const param of params) {
        request.input(param.name, param.type, param.value);
      }
      return await request.query(queryText);
    } catch (err) {
      this.logger.warn(`Query failed (${err?.code || err?.message}). Attempting reconnect retry...`);
      await this.ensureConnected();
      const request = this.pool.request();
      for (const param of params) {
        request.input(param.name, param.type, param.value);
      }
      return await request.query(queryText);
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close();
      this.logger.log('Database connection pool closed.');
    }
  }
}
