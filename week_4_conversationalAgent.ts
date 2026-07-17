import { parsePropertyQuery } from "../week2/propertySearch";
import { searchActiveListings } from "../week3/dbSearch";

interface UserSession {
  city?: string;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  type?: string;
  pool?: string;
  hasView?: string;
  conversationStep: number;
  lastResults?: any[];
}

const sessions = new Map<string, UserSession>();

export function getSession(userId: string): UserSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, { conversationStep: 0 });
  }
  return sessions.get(userId)!;
}

export function updateSession(userId: string, updates: Partial<UserSession>) {
  const session = getSession(userId);
  sessions.set(userId, { ...session, ...updates });
}

export function clearSession(userId: string) {
  sessions.delete(userId);
}

export async function handleMessage(userId: string, message: string): Promise<string> {
  const session = getSession(userId);

  // Parse the incoming message
  const parsed = await parsePropertyQuery(message);

  // Merge new filters into session
  if (parsed.city) updateSession(userId, { city: parsed.city });
  if (parsed.maxPrice) updateSession(userId, { maxPrice: parsed.maxPrice });
  if (parsed.beds) updateSession(userId, { beds: parsed.beds });
  if (parsed.baths) updateSession(userId, { baths: parsed.baths });
  if (parsed.type) updateSession(userId, { type: parsed.type });
  if (parsed.pool) updateSession(userId, { pool: parsed.pool });
  if (parsed.hasView) updateSession(userId, { hasView: parsed.hasView });

  const current = getSession(userId);

  // Ask follow-up questions if missing key filters
  if (!current.city) {
    updateSession(userId, { conversationStep: 1 });
    return "What city are you looking in?";
  }

  if (!current.maxPrice) {
    updateSession(userId, { conversationStep: 2 });
    return `Got it — searching in ${current.city}. What's your budget?`;
  }

  if (!current.beds) {
    updateSession(userId, { conversationStep: 3 });
    return "How many bedrooms minimum?";
  }

  // All key filters collected — run the search
  updateSession(userId, { conversationStep: 4 });
  const results = await searchActiveListings({
    city: current.city,
    maxPrice: current.maxPrice,
    beds: current.beds,
    baths: current.baths,
    type: current.type,
    pool: current.pool,
    hasView: current.hasView
  });

  updateSession(userId, { lastResults: results });

  if (results.length === 0) {
    clearSession(userId);
    return `No listings found in ${current.city} matching your criteria. Want to try a different search?`;
  }

  // Format top 3 results
  const formatted = results.slice(0, 3).map((l: any) =>
    `🏠 ${l.L_Address}, ${l.L_City}\n💰 $${l.price.toLocaleString()} | 🛏 ${l.beds}bd/${l.baths}ba | 📐 ${l.sqft} sqft\n📅 ${l.DaysOnMarket} days on market`
  ).join("\n\n");

  clearSession(userId);
  return `Found ${results.length} listings in ${current.city}:\n\n${formatted}`;
}