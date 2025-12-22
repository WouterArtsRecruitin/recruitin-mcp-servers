module.exports = {
  apps: [
    {
      name: 'labour-market-intelligence-mcp',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '500M'
    },
    {
      name: 'labour-market-intelligence-http',
      script: './dist/http-server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/http-err.log',
      out_file: './logs/http-out.log',
      log_file: './logs/http-combined.log',
      time: true,
      max_memory_restart: '500M'
    }
  ]
};
