import pandas as pd
import mysql.connector

conn_config = {
    "host": "localhost",
    "user": "root",
    "password": "password",
    "database": "idx_exchange"
}

def get_city_market_summary(city: str) -> dict:
    conn = mysql.connector.connect(**conn_config)
    query = """
        SELECT
            City,
            COUNT(*) AS sold_count,
            ROUND(AVG(ClosePrice), 0) AS avg_close_price,
            ROUND(AVG(ClosePrice / NULLIF(LivingArea, 0)), 0) AS avg_price_per_sqft,
            ROUND(AVG(DaysOnMarket), 1) AS avg_dom,
            ROUND(AVG(ClosePrice / NULLIF(ListPrice, 0)) * 100, 1) AS list_to_close_pct
        FROM california_sold
        WHERE City = %s
        AND PropertyType = 'Residential'
        AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        AND LivingArea > 0
        GROUP BY City
    """
    df = pd.read_sql(query, conn, params=(city,))
    conn.close()
    if df.empty:
        return {"error": f"No data found for {city}"}
    return df.iloc[0].to_dict()


def get_price_trend(city: str, months: int = 24) -> pd.DataFrame:
    conn = mysql.connector.connect(**conn_config)
    query = """
        SELECT
        DATE_FORMAT(CloseDate, '%Y-%m') AS month,
        COUNT(*) AS sales,
        ROUND(AVG(ClosePrice), 0) AS avg_price,
        ROUND(AVG(DaysOnMarket), 1) AS avg_dom
    FROM california_sold
    WHERE City = %s
    AND PropertyType = 'Residential'
    AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL %s MONTH)
    GROUP BY DATE_FORMAT(CloseDate, '%Y-%m')
    ORDER BY month
    """
    df = pd.read_sql(query, conn, params=(city, months))
    conn.close()
    df["price_change_pct"] = df["avg_price"].pct_change() * 100
    return df


if __name__ == "__main__":
    print("=== City Market Summary: Irvine ===")
    summary = get_city_market_summary("Irvine")
    for k, v in summary.items():
        print(f"{k}: {v}")

    print("\n=== Price Trend: San Diego (24 months) ===")
    trend = get_price_trend("San Diego", 24)
    print(trend.to_string(index=False))