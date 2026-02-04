const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { runCycle, stats } = require('./claim_and_distribute');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Endpoint for Frontend
app.get('/api/stats', (req, res) => {
    res.json({
        totalDistributed: stats.totalDistributed.toFixed(2),
        holders: 1337, // TODO: Wire up real holder count from the script
        distributions: stats.distributionsCount,
        lastUpdate: stats.lastRun
    });
});

let isRunning = false;

// Run automation every minute
cron.schedule('* * * * *', async () => {
    if (isRunning) {
        console.log("Skipping cycle: Previous run still in progress.");
        return;
    }

    isRunning = true;
    try {
        await runCycle();
    } catch (e) {
        console.error("Cron Error:", e);
    } finally {
        isRunning = false;
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Bot initialized: Cycle running every minute.');
});
