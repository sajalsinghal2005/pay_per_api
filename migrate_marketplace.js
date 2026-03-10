const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath);

const migrations = [
    { table: 'apis', column: 'badge', type: 'TEXT' },
    { table: 'user_apis', column: 'api_key', type: 'TEXT' }
];

db.serialize(() => {
    migrations.forEach(m => {
        db.run(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type}`, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`Column ${m.column} already exists in ${m.table}.`);
                } else {
                    console.error(`Error adding ${m.column} to ${m.table}:`, err.message);
                }
            } else {
                console.log(`Column ${m.column} added to ${m.table} successfully.`);
            }
        });
    });

    // Update some existing APIs with badges for testing
    db.run("UPDATE apis SET badge = 'Popular', category = 'Maps' WHERE name = 'MapBox API'");
    db.run("UPDATE apis SET badge = 'Trending', category = 'Weather' WHERE name = 'WeatherCast API'");
    db.run("UPDATE apis SET category = 'Payments' WHERE name = 'PayStack API'");
    db.run("UPDATE apis SET badge = 'New', category = 'Storage' WHERE name = 'CloudStore API'");
    db.run("UPDATE apis SET badge = 'Trending', category = 'Analytics' WHERE name = 'InsightLytics API'");
});

db.close();
