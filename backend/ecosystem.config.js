const path = require('path');

module.exports = [{
  script: 'dist/server.js',
  cwd: path.resolve(__dirname),
  name: 'empresa-backend',
  exec_mode: 'fork',
  cron_restart: '05 00 * * *',
  max_memory_restart: '769M',
  node_args: '--max-old-space-size=769',
  watch: false,
  kill_timeout: 5000,
  exp_backoff_restart_delay: 10000,
  listen_timeout: 15000
}]