/**
 * Vercel serverless entry point.
 * @vercel/node은 app.listen()이 아닌 Express app export를 요구함.
 */
import { createApp } from './app';

const { app } = createApp();
export default app;
