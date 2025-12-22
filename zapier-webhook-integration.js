const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Laad configuratie
const config = require('./zapier-integration-config.json');

// Webhook endpoint voor Zapier om bedrijven toe te voegen
app.post('/api/company-research', async (req, res) => {
    const { company_name, website, industry, location } = req.body;

    try {
        // Trigger Zapier Research Agent
        const response = await fetch(config.zapier.webhooks.trigger_research, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_name,
                website,
                industry,
                location,
                timestamp: new Date().toISOString(),
                source: 'recruitment-intelligence-portal'
            })
        });

        if (response.ok) {
            res.json({
                success: true,
                message: 'Research gestart voor ' + company_name,
                webhook_response: await response.text()
            });
        } else {
            throw new Error('Webhook call failed');
        }
    } catch (error) {
        console.error('Error triggering research:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint om resultaten van Zapier te ontvangen
app.post('/api/research-results', async (req, res) => {
    const results = req.body;

    try {
        // Sla resultaten op
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `research-results-${timestamp}.json`;
        await fs.writeFile(
            path.join(__dirname, 'reports', filename),
            JSON.stringify(results, null, 2)
        );

        console.log('Research results received:', results.company_name);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving results:', error);
        res.status(500).json({ success: false });
    }
});

// Test endpoint
app.get('/api/test-zapier', async (req, res) => {
    try {
        const testData = {
            company_name: "Test Bedrijf BV",
            website: "https://example.com",
            industry: "Technology",
            location: "Amsterdam",
            test: true
        };

        const response = await fetch(config.zapier.webhooks.trigger_research, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const result = await response.text();
        res.json({
            success: response.ok,
            status: response.status,
            response: result,
            webhook_url: config.zapier.webhooks.trigger_research
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = 3009;
app.listen(PORT, () => {
    console.log(`Zapier Integration Server running on http://localhost:${PORT}`);
    console.log(`Webhook URL: ${config.zapier.webhooks.trigger_research}`);
    console.log(`Test the integration: http://localhost:${PORT}/api/test-zapier`);
});