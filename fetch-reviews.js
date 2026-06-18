const fs = require('fs');
const API_KEY = process.env.GOOGLE_API_KEY;
const PLACE_ID = process.env.PLACE_ID;

async function main() {
  if (!API_KEY || !PLACE_ID) {
    throw new Error('Missing GOOGLE_API_KEY or PLACE_ID environment variable.');
  }
  const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'rating,userRatingCount',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  const rating = typeof data.rating === 'number' ? data.rating : 5.0;
  const count = typeof data.userRatingCount === 'number' ? data.userRatingCount : 0;
  const out = {
    rating: rating,
    ratingText: rating.toFixed(1).replace('.', ','),
    count: count,
    updated: new Date().toISOString().slice(0, 10),
  };
  fs.writeFileSync('reviews-meta.json', JSON.stringify(out, null, 2) + '\n');
  console.log('Wrote reviews-meta.json:', out);
}

main().catch((err) => { console.error(err); process.exit(1); });