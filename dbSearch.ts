import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "kunnu108",
  database: "idx_exchange",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const conn = await pool.getConnection();
  const [rows] = await conn.execute(sql, params);
  conn.release();
  return rows as any[];
}

export async function searchActiveListings(filters: any, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  let sql = `
    SELECT
      L_ListingID, L_Address, L_City, L_Zip,
      L_SystemPrice AS price, L_Keyword2 AS beds, LM_Dec_3 AS baths,
      LM_Int2_3 AS sqft, L_Type_ AS type, L_Status AS status,
      PoolPrivateYN, ViewYN, FireplaceYN, PhotoCount,
      LA1_UserFirstName, LA1_UserLastName, DaysOnMarket
    FROM rets_property WHERE L_Status = 'Active'
  `;
  const params: any[] = [];

  if (filters.city) { sql += " AND L_City = ?"; params.push(filters.city); }
  if (filters.maxPrice) { sql += " AND L_SystemPrice <= ?"; params.push(Number(filters.maxPrice)); }
  if (filters.beds) { sql += " AND L_Keyword2 >= ?"; params.push(Number(filters.beds)); }
  if (filters.baths) { sql += " AND LM_Dec_3 >= ?"; params.push(Number(filters.baths)); }
  if (filters.sqft) { sql += " AND LM_Int2_3 >= ?"; params.push(Number(filters.sqft)); }
  if (filters.type) { sql += " AND L_Type_ = ?"; params.push(filters.type); }
  if (filters.pool) { sql += " AND PoolPrivateYN = ?"; params.push(filters.pool); }
  if (filters.hasView) { sql += " AND ViewYN = ?"; params.push(filters.hasView); }

  sql += ` ORDER BY L_SystemPrice ASC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

  return query(sql, params);
}