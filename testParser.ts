import { parsePropertyQuery } from "./propertySearch";

const testQueries = [
  "Show me 3 bedroom homes in Irvine under 1.5m with a pool",
  "show 3 bathroom condominiums in Los Angeles with a view",
  "show me 2 bedroom condos in Los Angeles",
  "show me homes under 2m in Fremont with a view and a pool",
  "show me 2 bed 2 bath homes in Newport Beach with a max HOA under 500",
  "show me 2 bed condos in Sunnyvale under 800k",
  "show me homes under 2m with min sq ft of 2500 in pleasanton with a view",
  "3 bed townhomes in san diego under 775k",
  "4 bed 3 bath homes with a pool at least 2000 sq ft and under 1.5m in stockton",
  "2 bed 2 bath condos in san francisco under 2m"
];

async function runTests() {
  for (const query of testQueries) {
    const result = await parsePropertyQuery(query);
    console.log("\nQuery:", query);
    console.log("Parsed:", JSON.stringify(result, null, 2));
  }
}
runTests();