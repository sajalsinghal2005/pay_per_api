const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('f:/SUBODH_COLLEGE/app.db');

db.serialize(() => {
    // Get first 3 API IDs
    db.all("SELECT id FROM apis LIMIT 3", [], (err, rows) => {
        if (err) return console.error(err);

        rows.forEach(row => {
            db.run("INSERT OR IGNORE INTO user_apis (user_id, api_id) VALUES (1, ?)", [row.id], (err) => {
                if (err) console.error(err);
            });
        });
        console.log("Associated 3 APIs with User ID 1");
        db.close();
    });
});
