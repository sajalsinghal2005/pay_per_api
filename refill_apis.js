const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('app.db');

db.serialize(() => {
    console.log("Cleaning existing APIs...");
    db.run("DELETE FROM apis");

    const stmt = db.prepare("INSERT INTO apis (name, provider, description, category, price, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)");

    const apis = [
        ['MapBox API', 'MapBox', 'High-performance vector maps and geocoding', 'Mapping', 100, 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600', 'active'],
        ['WeatherCast API', 'AtmoSphere', 'Real-time Weather Data', 'Data', 50, 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=600', 'active'],
        ['PayStack API', 'FinSecure', 'Secure Payment Gateway', 'Finance', 200, 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600', 'active'],
        ['CloudStore API', 'InfraCloud', 'Object storage and file management', 'Cloud', 150, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600', 'active'],
        ['InsightLytics API', 'DataDriven Co.', 'Advanced analytics and tracking', 'Analytics', 250, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600', 'active'],
        ['AuthShield API', 'SecureLayer', 'Authentication & Identity', 'Security', 150, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600', 'active'],
        ['VisionAI API', 'DeepSight', 'Computer vision and image recognition', 'AI', 300, 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=600', 'active'],
        ['BlockChain Core', 'CryptoTech', 'Decentralized ledger API for web3', 'Blockchain', 450, 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=600', 'active'],
        ['ShipTrack API', 'LogiFlow', 'Global shipping and parcel tracking', 'E-commerce', 120, 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600', 'active'],
        ['GameStat Pro', 'PlayMetrics', 'Real-time gaming stats and leaderboards', 'Gaming', 80, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600', 'active'],
        ['HealthSync API', 'MediLink', 'Patient data and vitals synchronization', 'Health', 500, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600', 'active'],
        ['IoT Connect', 'SmartNodes', 'Manage and monitor IoT device networks', 'IoT', 180, 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600', 'active'],
        ['SocialGraph API', 'ConnectHub', 'Social media graph and influencer data', 'Social', 220, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600', 'active'],
        ['TranslateNow', 'LinguaSoft', 'Global translation and localization', 'Utility', 100, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600', 'active'],
        ['EcoMetric API', 'GreenWatch', 'Track carbon footprint and sustainability', 'Environment', 60, 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600', 'active'],
        ['CodeLint Pro', 'DevArmor', 'Automated code review and security linting', 'DevTools', 140, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=600', 'active'],
        ['FinanceFlow API', 'BankWise', 'Real-time stock and crypto market data', 'Finance', 350, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600', 'active']
    ];

    apis.forEach(api => {
        stmt.run(...api);
    });

    stmt.finalize();
    console.log("Marketplace re-seeded successfully with 15+ APIs!");
    db.close();
});
