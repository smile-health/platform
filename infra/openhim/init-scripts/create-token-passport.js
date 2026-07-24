#!/usr/bin/env node
'use strict';

/**
 * Creates the SHA-512 'token' passport for the admin user in OpenHIM's MongoDB.
 *
 * WHY: openhim-mediator-utils authenticates against the OpenHIM REST API using a
 * custom SHA-512 challenge-response scheme. It calls GET /authenticate/:email to
 * get a salt, then computes sha512(sha512(salt+password) + salt + ts) as the token.
 * OpenHIM resolves the salt from a 'token' protocol passport in the passports collection.
 * When users are created via the REST API (POST/PUT /users), OpenHIM only creates the
 * 'local' (bcrypt) passport for web UI login — not the 'token' passport. This means
 * any user created via API cannot be used for mediator registration until this script runs.
 *
 * Algorithm (from openhim-mediator-utils/auth.js):
 *   passwordHash = sha512(passwordSalt + password)
 */

const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.mongo_url;
const ADMIN_EMAIL = process.env.OPENHIM_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.OPENHIM_ADMIN_PASSWORD;

const missing = ['mongo_url', 'OPENHIM_ADMIN_EMAIL', 'OPENHIM_ADMIN_PASSWORD']
  .filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[create-token-passport] ERROR: missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

async function run() {
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const db = client.db('openhim');
    const passports = db.collection('passports');

    // Check if token passport already exists
    const existing = await passports.findOne({ email: ADMIN_EMAIL, protocol: 'token' });
    if (existing) {
      console.log(`[create-token-passport] Token passport already exists for ${ADMIN_EMAIL} — skipping`);
      return;
    }

    // Generate salt (UUID v4 without crypto.randomUUID for older Node compat)
    const salt = [
      crypto.randomBytes(4).toString('hex'),
      crypto.randomBytes(2).toString('hex'),
      '4' + crypto.randomBytes(2).toString('hex').slice(1),
      ((parseInt(crypto.randomBytes(1).toString('hex'), 16) & 0x3f) | 0x80).toString(16) + crypto.randomBytes(1).toString('hex'),
      crypto.randomBytes(6).toString('hex'),
    ].join('-');

    // Compute passwordHash = sha512(salt + password)
    const passwordHash = crypto.createHash('sha512').update(salt + ADMIN_PASSWORD).digest('hex');

    await passports.insertOne({
      protocol: 'token',
      passwordAlgorithm: 'sha512',
      passwordHash,
      passwordSalt: salt,
      email: ADMIN_EMAIL,
      __v: 0,
    });

    console.log(`[create-token-passport] Token passport created for ${ADMIN_EMAIL}`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error('[create-token-passport] ERROR:', err.message);
  process.exit(1);
});
