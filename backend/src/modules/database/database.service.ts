import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

export function normalizeRow(row: any) {
  if (!row || typeof row !== 'object') return row;
  const normalized: Record<string, any> = {};

  for (const key of Object.keys(row)) {
    const val = row[key];
    normalized[key] = val; // lowercase
    
    // Auto-map PascalCase
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    normalized[pascalKey] = val;

    // Common standard ID / camelCase mappings
    if (key === 'userid') normalized['UserID'] = val;
    if (key === 'garageid') normalized['GarageID'] = val;
    if (key === 'vehicleid') normalized['VehicleID'] = val;
    if (key === 'appointmentid') normalized['AppointmentID'] = val;
    if (key === 'categoryid') normalized['CategoryID'] = val;
    if (key === 'itemid') normalized['ItemID'] = val;
    if (key === 'historyid') normalized['HistoryID'] = val;
    if (key === 'scheduleid') normalized['ScheduleID'] = val;
    if (key === 'documentid') normalized['DocumentID'] = val;
    if (key === 'reviewid') normalized['ReviewID'] = val;
    if (key === 'notificationid') normalized['NotificationID'] = val;
    if (key === 'paymentid') normalized['PaymentID'] = val;
    if (key === 'logid') normalized['LogID'] = val;
    if (key === 'fullname') normalized['FullName'] = val;
    if (key === 'phonenumber') normalized['PhoneNumber'] = val;
    if (key === 'passwordhash') normalized['PasswordHash'] = val;
    if (key === 'licenseplate') normalized['LicensePlate'] = val;
    if (key === 'vehicletype') normalized['VehicleType'] = val;
    if (key === 'manufactureyear') normalized['ManufactureYear'] = val;
    if (key === 'purchasedate') normalized['PurchaseDate'] = val;
    if (key === 'currentodometer') normalized['CurrentOdometer'] = val;
    if (key === 'iscommercial') normalized['IsCommercial'] = val;
    if (key === 'htxcode') normalized['HTXCode'] = val;
    if (key === 'badgenumber') normalized['BadgeNumber'] = val;
    if (key === 'appointmentdate') normalized['AppointmentDate'] = val;
    if (key === 'depositamount') normalized['DepositAmount'] = val;
    if (key === 'paymentstatus') normalized['PaymentStatus'] = val;
    if (key === 'executiondate') normalized['ExecutionDate'] = val;
    if (key === 'executionodometer') normalized['ExecutionOdometer'] = val;
    if (key === 'totalcost') normalized['TotalCost'] = val;
    if (key === 'intervalkm') normalized['IntervalKm'] = val;
    if (key === 'intervalmonths') normalized['IntervalMonths'] = val;
    if (key === 'targetodometer') normalized['TargetOdometer'] = val;
    if (key === 'targetdate') normalized['TargetDate'] = val;
    if (key === 'categoryname') normalized['CategoryName'] = val;
    if (key === 'garagename') normalized['GarageName'] = val;
    if (key === 'createdat') normalized['CreatedAt'] = val;
    if (key === 'updatedat') normalized['UpdatedAt'] = val;
    if (key === 'isactive') normalized['IsActive'] = val;
    if (key === 'isread') normalized['IsRead'] = val;
    if (key === 'receivezalonotif') normalized['ReceiveZaloNotif'] = val;
    if (key === 'receivesmsnotif') normalized['ReceiveSmsNotif'] = val;
    if (key === 'zalonumber') normalized['ZaloPhoneNumber'] = val;
  }

  return new Proxy(normalized, {
    get(target, prop: string | symbol) {
      if (typeof prop === 'string') {
        if (prop in target) return target[prop];
        const lower = prop.toLowerCase();
        if (lower in target) return target[lower];
      }
      return target[prop as any];
    }
  });
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  private getPoolConfig() {
    const host = this.configService.get<string>('DB_HOST') || 'aws-0-ap-south-1.pooler.supabase.com';
    const port = parseInt(this.configService.get<string>('DB_PORT') || '5432', 10);
    const user = this.configService.get<string>('DB_USER') || 'postgres.cgkfqswuammksstxtzda';
    const password = this.configService.get<string>('DB_PASSWORD') || '?SaPWDZY7pYj$5!';
    const database = this.configService.get<string>('DB_NAME') || 'postgres';

    return {
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  async onModuleInit() {
    const config = this.getPoolConfig();

    try {
      this.pool = new Pool(config);
      const client = await this.pool.connect();
      const res = await client.query('SELECT NOW() as current_time;');
      client.release();
      this.logger.log(`Connected to Supabase PostgreSQL Cloud successfully (${config.host}:${config.port}) at ${res.rows[0].current_time}`);
    } catch (err) {
      this.logger.error('Failed to connect to Supabase PostgreSQL:', err?.message || err);
    }
  }

  private transformSql(queryText: string, params: { name: string; type?: any; value: any }[] = []) {
    let sql = queryText;

    // 1. T-SQL functions -> Postgres functions
    sql = sql.replace(/GETDATE\(\)/gi, 'NOW()');
    sql = sql.replace(/ISNULL\(/gi, 'COALESCE(');
    sql = sql.replace(/N'([^']*)'/g, "'$1'");

    // 2. DATEDIFF & DATEADD unquoted 'day' -> 'day'
    sql = sql.replace(/\b(DATEDIFF|DATEADD)\s*\(\s*day\s*,/gi, "$1('day',");

    // 3. String concatenation with + in SQL (e.g. '%' + @search + '%')
    while (/'[^']*'\s*\+|\+\s*'[^']*'|@[a-zA-Z0-9_]+\s*\+\s*'/g.test(sql)) {
      const before = sql;
      sql = sql.replace(/('[^']*')\s*\+\s*(@[a-zA-Z0-9_]+|[a-zA-Z0-9_\.]+)/g, '$1 || $2');
      sql = sql.replace(/(@[a-zA-Z0-9_]+|[a-zA-Z0-9_\.]+)\s*\+\s*('[^']*')/g, '$1 || $2');
      sql = sql.replace(/('[^']*')\s*\+\s*('[^']*')/g, '$1 || $2');
      if (sql === before) break;
    }

    // 4. Handle T-SQL OUTPUT INSERTED placed before VALUES -> RETURNING
    const outputMatch = sql.match(/OUTPUT\s+INSERTED\.([a-zA-Z0-9_]+|\*)/i);
    if (outputMatch) {
      const returnCol = outputMatch[1] === '*' ? '*' : outputMatch[1];
      sql = sql.replace(/OUTPUT\s+INSERTED\.([a-zA-Z0-9_]+|\*)/gi, '');
      if (!/RETURNING\b/i.test(sql)) {
        sql = sql.trim().replace(/;$/, '') + ` RETURNING ${returnCol}`;
      }
    }

    // 5. Handle UNION SELECT TOP N -> UNION SELECT
    sql = sql.replace(/UNION\s+SELECT\s+TOP\s+(\d+)\s+/gi, 'UNION SELECT ');

    // 6. Handle T-SQL SELECT TOP N -> Postgres LIMIT N
    const topMatch = sql.match(/SELECT\s+TOP\s+(\d+)\s+/i);
    if (topMatch) {
      const limitNum = topMatch[1];
      sql = sql.replace(/SELECT\s+TOP\s+\d+\s+/i, 'SELECT ');
      if (!/\bLIMIT\b/i.test(sql)) {
        sql = sql.trim().replace(/;$/, '') + ` LIMIT ${limitNum}`;
      }
    }

    // 7. Boolean 0/1 comparisons
    sql = sql.replace(/\b(IsRead|IsActive|IsCommercial|IsRequired)\s*=\s*0\b/gi, '$1 = false');
    sql = sql.replace(/\b(IsRead|IsActive|IsCommercial|IsRequired)\s*=\s*1\b/gi, '$1 = true');

    // 3. Named parameters (@paramName) -> Positional parameters ($1, $2, ...)
    const values: any[] = [];
    const paramMap = new Map<string, any>();

    // 8. Auto-coerce Bit / Boolean parameters
    params.forEach(p => {
      let val = p.value;
      const typeStr = p.type ? (p.type.name || p.type.declaration || '').toLowerCase() : '';
      if (typeStr === 'bit' || p.name.toLowerCase().startsWith('is') || p.name.toLowerCase().startsWith('receive')) {
        if (val === 1 || val === '1') val = true;
        if (val === 0 || val === '0') val = false;
      }
      paramMap.set(p.name.toLowerCase(), val);
    });

    let paramIndex = 1;
    const namedParamRegex = /@([a-zA-Z0-9_]+)/g;

    sql = sql.replace(namedParamRegex, (match, paramName) => {
      const key = paramName.toLowerCase();
      if (paramMap.has(key)) {
        values.push(paramMap.get(key));
        return `$${paramIndex++}`;
      }
      return match;
    });

    // Fallback: if query already uses $1, $2 or no @param was matched but params were passed
    if (values.length === 0 && params.length > 0) {
      params.forEach(p => values.push(p && typeof p === 'object' && 'value' in p ? p.value : p));
    }

    return { sql, values };
  }

  async query(queryText: string, params: { name: string; type?: any; value: any }[] = []) {
    if (!this.pool) {
      const config = this.getPoolConfig();
      this.pool = new Pool(config);
    }

    try {
      const { sql, values } = this.transformSql(queryText, params);
      const res = await this.pool.query(sql, values);
      const normalizedRows = (res.rows || []).map(normalizeRow);

      return {
        recordset: normalizedRows,
        recordsets: [normalizedRows],
        rowsAffected: [res.rowCount || 0],
      };
    } catch (err) {
      this.logger.error(`Query failed: ${err?.message} - SQL: ${queryText}`);
      throw err;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Supabase PostgreSQL connection pool closed.');
    }
  }
}
