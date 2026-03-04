const apiUrl = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('Testing Admin Login...');
        const adminRes = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@admin.com', password: 'admin' })
        });
        const adminData = await adminRes.json();
        console.log('Admin login success:', adminData.success);

        console.log('Testing Admin Dashboard Stats...');
        const statsRes = await fetch(`${apiUrl}/admin/stats`);
        const statsData = await statsRes.json();
        console.log('Admin Stats Revenue:', statsData.revenue);

        console.log('Testing User Dashboard API...');
        const userRes = await fetch(`${apiUrl}/user/1/dashboard`);
        const userData = await userRes.json();
        console.log('User Dashboard credits:', userData.credits);

        console.log('All tests passed.');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTests();
