/*!
 * Cryptography
 * @copyright (c) 2020 Sixcious
 * @license https://github.com/sixcious/shr/blob/main/LICENSE
 */

/**
 * Cryptography contains various functions that use the window.crypto API.
 *
 * Cryptography provides the following features:
 * 1. Generates a securely random number
 * 2. Generates a securely random string
 * 3. Calculates a cryptographic digest
 * 4. Computes an HMAC-SHA256 signature
 * 5. Calculates a cryptographic hash
 * 6. Generates a securely random cryptographic salt
 * 7. Encrypts plaintext into ciphertext
 * 8. Decrypts ciphertext into plaintext
 *
 * Important Note:
 * According to MDN, crypto (window.crypto) is available on all Windows. However, in insecure contexts (such as when the
 * page is being served using the http protocol instead of https), crypto only has one usable method: getRandomValues().
 *
 * In general, we should only use this API in secure contexts.
 *
 * How to use Cryptography
 * -----------------------
 *
 * 1. Random Numbers:
 * Generate a random number between a minimum and maximum value by supplying the two arguments to the function
 *
 * const number = Cryptography.randomNumber(1, 100);
 *
 * 2. Random Strings:
 * Generate a random string of any length and alphabet by supplying the two arguments to the function
 *
 * const string = Cryptography.randomString(16, "abc123!");
 *
 * 3. Digest:
 * Compute a fast SHA-256 digest of a value with a secret mixed in for tamper detection
 *
 * const digest = await Cryptography.digest("plaintext", "secret");
 *
 * 4. Sign:
 * Compute an HMAC-SHA256 signature for a value using a secret key. Always produces 32 bytes (43 base64url chars without padding).
 * Recompute and compare to verify: a matching signature means the value was produced by someone who holds the secret.
 *
 * const signature = await Cryptography.sign("plaintext", "secret");
 * const verified = signature === await Cryptography.sign("plaintext", "secret");
 *
 * 5/6. Hashing/Salting:
 * You can use this to store hashes of sensitive data (e.g. passwords) and then run the hash function against the
 * plaintext password when it's entered again to see if it matches the hash you're storing
 * Note that you should also store the salt you used to generate the hash in your schema
 *
 * const salt = Cryptography.salt();
 * const hash = await Cryptography.hash("plaintext", salt);
 *
 * 7/8. Encrypting/Decrypting:
 * Generate a secret key however you prefer (for quick demonstration purposes, this uses Cryptography.salt())
 *
 * const key = Cryptography.salt();
 * const encryption = await Cryptography.encrypt("plaintext", key);
 * const decryption = await Cryptography.decrypt(encryption.ciphertext, encryption.iv, key);
 * @see https://developer.mozilla.org/docs/Web/API/Window/crypto
 */
class Cryptography {

  /**
   * Variables
   *
   * @var {number} length - the default length, 512 Bits = 64 Bytes = 86 base64url characters (padding omitted, URL-friendly)
   * @var {string} secret - the fallback HMAC secret used when no secret is provided to the digest() and sign() functions
   */
  static #length = 64;
  static #secret = "x";

  /**
   * Generates a random number securely in the range of min (inclusive) and max (inclusive).
   * For example, randomNumber(0,16) will return a number between 0-16.
   *
   * @param {number} min - the minimum number in the range (inclusive)
   * @param {number} max - the maximum number in the range (inclusive)
   * @returns {number} the randomly generated number
   * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
   * @see https://stackoverflow.com/a/62792582
   */
  static randomNumber(min = 0, max = 16) {
    min = Math.ceil(min);
    max = Math.floor(max);
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);
    return Math.floor(random * (max - min + 1) + min);
  }

  /**
   * Generates a random string securely using an alphabet of characters in the desired length.
   *
   * @param {number} length - the length the string should be
   * @param {string} alphabet - the alphabet containing the character candidates in the string
   * @returns {string} the randomly generated string
   */
  static randomString(length = 16, alphabet = "abcdefghijklmnopqrstuvwxyz") {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += alphabet.charAt(Cryptography.randomNumber(0, alphabet.length - 1));
    }
    return result;
  }

  /**
   * Calculates a simple cryptographic digest using SHA-256. This is much faster than hash() and is suitable for
   * non-password use cases like data integrity verification (e.g. verifying a storage write originated from our code).
   * A secret is mixed in to prevent the digest from being forged by an external actor without knowledge of the secret.
   * Produces 64 hex characters and 43 base64url characters.
   *
   * @param {string} text - the text to digest
   * @param {string} secret - a secret mixed into the digest to make it unforgeable instead of a hardcoded string
   * @returns {Promise<string>} the digest as an encoded string
   */
  static async digest(text, secret = Cryptography.#secret) {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text + secret));
    return Cryptography.#u8a2str(new Uint8Array(hash));
  }

  /**
   * Computes an HMAC-SHA256 signature for the given text using a secret key.
   * HMAC-SHA256 always produces exactly 32 bytes, which encodes to a fixed, predictable length
   * regardless of the length of the text or secret. This makes it ideal for storing alongside text values for integrity
   * verification (e.g. detecting tampering with stored stats or usernames) and is more semantic than digest().
   * Produces 64 hex characters and 43 base64url characters.
   *
   * @param {string} text - the text to sign
   * @param {string} secret - the secret key used to compute the signature (if empty, falls back to #defaultSecret)
   * @returns {Promise<string>} the HMAC-SHA256 signature as an encoded string
   */
  static async sign(text, secret = Cryptography.#secret) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
    return Cryptography.#u8a2str(new Uint8Array(signature));
  }

  /**
   * Calculates a cryptographic hash. We use the PBKDF2 algorithm with an Hmac-SHA512 hash function.
   * For simplicity, we hardcode the algorithm, hash, and iterations.
   * Produces 128 hex characters, 86 base64url characters by default.
   * 
   * Note: Firefox hangs if the text is empty.
   *
   * @param {string} text - the text to hash
   * @param {string} salt - the salt to hash with
   * @param {number} length - the number of bytes of the hash output
   * @returns {Promise<string>} the hash as an encoded string
   */
  static async hash(text, salt, length = Cryptography.#length) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(text), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-512", salt: Cryptography.#str2u8a(salt), iterations: 1000 }, key, length * 8);
    return Cryptography.#u8a2str(new Uint8Array(bits));
  }

  /**
   * Generates a random cryptographic salt.
   * Produces 128 hex characters, 86 base64url characters by default.
   *
   * @param {number} length - the length of the unsigned integer array
   * @returns {string} the salt as an encoded string
   */
  static salt(length = Cryptography.#length) {
    return Cryptography.#u8a2str(crypto.getRandomValues(new Uint8Array(length)));
  }

  /**
   * Encrypts plaintext into ciphertext using a symmetric key. We use the AES-GCM algorithm with a SHA256 hash function.
   * For simplicity, we hardcode the algorithm.
   * The IV is 12 bytes (24 hex characters, 16 base64url characters).
   * Ciphertext is plaintext length plus a 16-byte authentication tag (hex = 2×byteCount, base64url = 4×ceil(byteCount/3) without padding).
   *
   * @param {string} plaintext - the text to encrypt
   * @param {string} secret - the secret key
   * @param {number} length - the length of the iv in bytes (12 bytes / 96 bits is the AES-GCM standard)
   * @returns {Promise<{iv: string, ciphertext: string}>} the iv and ciphertext as encoded strings
   */
  static async encrypt(plaintext, secret, length = 12) {
    const algorithm = { name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(length)) };
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    const key = await crypto.subtle.importKey("raw", digest, algorithm, false, ["encrypt"]);
    const encryption = await crypto.subtle.encrypt(algorithm, key, new TextEncoder().encode(plaintext));
    return { iv: Cryptography.#u8a2str(algorithm.iv), ciphertext: Cryptography.#u8a2str(new Uint8Array(encryption)) };
  }

  /**
   * Decrypts ciphertext into plaintext using a symmetric key. We use the AES-GCM algorithm with a SHA256 hash function.
   * For simplicity, we hardcode the algorithm.
   * The IV is 12 bytes (24 hex characters, 16 base64url characters).
   * Ciphertext is plaintext length plus a 16-byte authentication tag (hex = 2×byteCount, base64url = 4×ceil(byteCount/3) without padding).
   *
   * @param {string} ciphertext - the text to decrypt
   * @param {string} iv - the initialization vector for the algorithm
   * @param {string} secret - the secret key
   * @returns {Promise<string>} the decrypted text
   */
  static async decrypt(ciphertext, iv, secret) {
    const algorithm = { name: "AES-GCM", iv: Cryptography.#str2u8a(iv) };
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    const key = await crypto.subtle.importKey("raw", digest, algorithm, false, ["decrypt"]);
    const decryption = await crypto.subtle.decrypt(algorithm, key, Cryptography.#str2u8a(ciphertext));
    return new TextDecoder().decode(decryption);
  }

  /**
   * Converts an 8-bit Unsigned Integer Array to a String by encoding it.
   * 
   * @param {Uint8Array} u8a - the unsigned 8-bit integer array
   * @returns {string} the encoded string
   */
  static #u8a2str(u8a) {
    return u8a.toHex ? u8a.toHex() : Array.from(u8a, b => b.toString(16).padStart(2, "0")).join("");
    // if (u8a.toBase64) { return u8a.toBase64({ alphabet: "base64url", omitPadding: true }); }
    // let s = ""; for (const b of u8a) { s += String.fromCharCode(b); } return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  /**
   * Converts a String to an 8-bit Unsigned Integer Array by decoding it.
   * 
   * @param {string} str - the encoded string
   * @returns {Uint8Array} the unsigned 8-bit integer array
   */
  static #str2u8a(str) {
    return Uint8Array.fromHex ? Uint8Array.fromHex(str) : new Uint8Array(Array.from({ length: str.length / 2 }, (_, i) => parseInt(str.slice(i * 2, i * 2 + 2), 16)));
    // if (Uint8Array.fromBase64) { return Uint8Array.fromBase64(str, { alphabet: "base64url" }); }
    // const binary = atob(str.replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(binary, c => c.charCodeAt(0));
  }

}