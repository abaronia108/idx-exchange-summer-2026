import { searchActiveListings } from "./dbSearch";

async function runTests() {
  console.log("Test 1: 3 bed homes in Irvine under 1.5m with pool");
  const results1 = await searchActiveListings({
    city: "Irvine",
    maxPrice: 1500000,
    beds: 3,
    pool: "True"
  });
  console.log(`Found ${results1.length} listings`);
  if (results1.length > 0) console.log(JSON.stringify(results1[0], null, 2));

  console.log("\nTest 2: Condos in San Diego under 700k");
  const results2 = await searchActiveListings({
    city: "San Diego",
    maxPrice: 700000,
    type: "Condominium"
  });
  console.log(`Found ${results2.length} listings`);
  if (results2.length > 0) console.log(JSON.stringify(results2[0], null, 2));

  console.log("\nTest 3: Single family homes in Pasadena with view");
  const results3 = await searchActiveListings({
    city: "Pasadena",
    type: "SingleFamilyResidence",
    hasView: "True"
  });
  console.log(`Found ${results3.length} listings`);
  if (results3.length > 0) console.log(JSON.stringify(results3[0], null, 2));

  process.exit(0);
}

runTests().catch(console.error);