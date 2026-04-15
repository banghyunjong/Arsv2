import { createApp } from './app';

const { app, config } = createApp();

app.listen(config.server.port, config.server.host, () => {
  console.log(`[ARSV2] Server running at http://${config.server.host}:${config.server.port}`);
  console.log(`[ARSV2] Environment: ${config.env}`);
});
