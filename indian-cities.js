// Common Indian cities for fuzzy matching / "Did you mean?" suggestions
const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "New Delhi",
  "Bangalore",
  "Bengaluru",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Allahabad",
  "Prayagraj",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Chandigarh",
  "Guwahati",
  "Solapur",
  "Hubli",
  "Mysore",
  "Mysuru",
  "Tiruchirappalli",
  "Bareilly",
  "Aligarh",
  "Tiruppur",
  "Moradabad",
  "Jalandhar",
  "Bhubaneswar",
  "Salem",
  "Warangal",
  "Guntur",
  "Bhiwandi",
  "Saharanpur",
  "Gorakhpur",
  "Bikaner",
  "Amravati",
  "Noida",
  "Jamshedpur",
  "Bhilai",
  "Cuttack",
  "Firozabad",
  "Kochi",
  "Nellore",
  "Bhavnagar",
  "Dehradun",
  "Durgapur",
  "Asansol",
  "Rourkela",
  "Nanded",
  "Kolhapur",
  "Ajmer",
  "Akola",
  "Gulbarga",
  "Jamnagar",
  "Ujjain",
  "Loni",
  "Siliguri",
  "Jhansi",
  "Ulhasnagar",
  "Jammu",
  "Sangli",
  "Mangalore",
  "Erode",
  "Belgaum",
  "Ambattur",
  "Tirunelveli",
  "Malegaon",
  "Gaya",
  "Udaipur",
  "Thiruvananthapuram",
  "Trivandrum",
  "Kozhikode",
  "Calicut",
  "Pondicherry",
  "Puducherry",
  "Shimla",
  "Manali",
  "Darjeeling",
  "Ooty",
  "Munnar",
  "Leh",
  "Ladakh",
  "Goa",
  "Panaji",
];

/**
 * Levenshtein distance between two strings (case-insensitive)
 */
function levenshtein(a, b) {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  const matrix = [];

  for (let i = 0; i <= al.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al.length; i++) {
    for (let j = 1; j <= bl.length; j++) {
      const cost = al[i - 1] === bl[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[al.length][bl.length];
}

/**
 * Find the best fuzzy matches for a misspelled query from the Indian city list.
 * Returns up to `limit` suggestions that are within a reasonable edit distance.
 */
export function suggestCorrections(query, limit = 3) {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase().trim();

  // First: check prefix matches (handles partial typing)
  const prefixMatches = INDIAN_CITIES.filter((city) =>
    city.toLowerCase().startsWith(q)
  );
  if (prefixMatches.length > 0) {
    return prefixMatches.slice(0, limit);
  }

  // Second: fuzzy match using Levenshtein distance
  // Allow more tolerance for longer queries
  const maxDistance = q.length <= 4 ? 2 : q.length <= 7 ? 3 : 4;

  const scored = INDIAN_CITIES.map((city) => ({
    city,
    distance: levenshtein(q, city.toLowerCase()),
  }))
    .filter((item) => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return scored.slice(0, limit).map((item) => item.city);
}
