
require('dotenv').config(); // Try to load from .env even if we didn't see it (maybe permission issue?)
console.log('REVEALED_URL:', process.env.NETLIFY_DATABASE_URL);
