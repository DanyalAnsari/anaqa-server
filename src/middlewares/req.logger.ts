<<<<<<< HEAD
import pinoHttp from "pino-http";
import { logger } from "@/shared/utils/logger";
=======
import pinoHttp from 'pino-http';
import { logger } from '@/utils/logger';
>>>>>>> 3f38b03 (Resolve merge conflicts)

export const requestLogger = pinoHttp({
  logger,
  autoLogging: true,
  customLogLevel: (_req, res, err) => {
<<<<<<< HEAD
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
=======
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
>>>>>>> 3f38b03 (Resolve merge conflicts)
  },
  customSuccessMessage: (req, _res) => {
    return `${req.method} ${req.url} completed`;
  },
  customErrorMessage: (req, _res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> 3f38b03 (Resolve merge conflicts)
