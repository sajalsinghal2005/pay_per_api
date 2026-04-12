const { dbAll } = require('./config/database');

async function check() {
    try {
        const apis = await dbAll("SELECT * FROM apis");
        console.log(`Found ${apis.length} APIs in the database.`);
        apis.forEach(api => {
            console.log(`- ${api.name} (${api.category})`);
        });
        process.exit(0);
    } catch (err) {
        console.error("Error checking APIs:", err);
        process.exit(1);
    }
}

check();
