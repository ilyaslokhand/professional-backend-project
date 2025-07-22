import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials:true,
}));

app.use(express.json({limit:"100kb"}));
app.use(express.urlencoded({extended:true, limit:"100kb"}));
app.use(express.static("public"))

app.use(cookieParser());


// Import routes

import userRoutes from './routes/user.routes.js';

app.use('/api/v1/users', userRoutes);



export default app;


// Notes: we will use .use with app where we are using middleware or doing any confriguration