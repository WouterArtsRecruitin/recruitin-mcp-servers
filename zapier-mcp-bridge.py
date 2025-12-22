#!/usr/bin/env python3
"""
Zapier MCP Bridge for Claude Code
Enables Claude to trigger Zaps and read data from Zapier
"""

import json
import os
import requests
from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

ZAPIER_WEBHOOK_URL = os.getenv('ZAPIER_WEBHOOK_URL')
ZAPIER_API_KEY = os.getenv('ZAPIER_API_KEY')

@app.route('/trigger', methods=['POST'])
def trigger_zap():
    """Trigger a Zapier webhook"""
    data = request.json

    # Send to Zapier
    response = requests.post(
        ZAPIER_WEBHOOK_URL,
        json={
            'timestamp': datetime.now().isoformat(),
            'source': 'claude-mcp',
            'data': data
        },
        headers={'X-API-Key': ZAPIER_API_KEY}
    )

    return jsonify({
        'status': 'success',
        'zap_response': response.status_code
    })

@app.route('/list-zaps', methods=['GET'])
def list_zaps():
    """List available Zaps"""
    # This would connect to Zapier API
    return jsonify({
        'zaps': [
            {'id': '1', 'name': 'Claude to Notion'},
            {'id': '2', 'name': 'Claude to Slack'},
            {'id': '3', 'name': 'Claude to Email'}
        ]
    })

if __name__ == '__main__':
    app.run(port=3004, debug=False)
