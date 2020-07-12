'use strict';

var crypto = require('crypto');
/*
 * Return a salted and hashed password entry from a
 * clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry
 * where passwordEntry is an object with two string
 * properties:
 *      salt - The salt used for the password.
 *      hash - The sha1 hash of the password and salt
 * When a user sets their password, compute a random number 
 * and concatenate it with the password before computing the 
 * SHA-1 digest (the crypto package randomBytes function with 
 * a length of 8 will return a suitable random number）.
 */
function makePasswordEntry(clearTextPassword) {
    var salt = crypto.randomBytes(8).toString('hex');
    var hash = crypto
        .createHash('sha1')
        .update(salt + clearTextPassword)
        .digest('hex');
    return {
        salt: salt,
        hash: hash
    }
}

/*
 * Return true if the specified clear text password
 * and salt generates the specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    var hashToCompare = crypto
        .createHash('sha1')
        .update(salt + clearTextPassword)
        .digest('hex');
    if (hash == hashToCompare) return true;
    return false;
}

var cs142password = {
    doesPasswordMatch: doesPasswordMatch,
    makePasswordEntry: makePasswordEntry
}

// make this available 
module.exports = cs142password;