const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('app.db');

db.all("SELECT * FROM apis", [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Found ${rows.length} APIs`);
    console.log(JSON.stringify(rows, null, 2));
    db.close();
});
