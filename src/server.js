import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routers/index.js'
import { env } from './utils/env.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { UPLOAD_DIR } from './constants/index.js';


const PORT = Number(env('PORT', '3000'));

export const setupServer = () => {
    const app = express();
    app.use(express.json({
        type: ['application/json', 'application/vnd.api+json'],
    }))
    app.use(cors());

    app.use(cookieParser());

    app.use(
        pino({
            transport: {
                target: 'pino-pretty',
            },
        }),
    );


    app.get('/', (req, res) => {
        res.json({
            message: 'Hello world!',
        });
    });

    app.use(router);

    app.use('*', notFoundHandler);

    app.use(errorHandler);

    app.use('/uploads', express.static(UPLOAD_DIR));

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};









