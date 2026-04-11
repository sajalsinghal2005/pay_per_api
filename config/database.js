/**
 * Database Query Helpers - Promise-based wrappers for SQLite3
 * Provides clean async/await interface for database operations
 */

const db = require('../database');

/**
 * Execute INSERT, UPDATE, DELETE query
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<object>} Result object with lastID, changes
 */
const dbRun = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

/**
 * Execute SELECT query, return first row
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<object>} Single row object or undefined
 */
const dbGet = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

/**
 * Execute SELECT query, return all rows
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<array>} Array of row objects
 */
const dbAll = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });

module.exports = {
    dbRun,
    dbGet,
    dbAll
};
