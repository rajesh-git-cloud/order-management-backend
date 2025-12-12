import express from 'express';
import ordersRouter from './routes/orders';
import bodyParser from 'body-parser';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRouter from "./routes/auth";

const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:4200',  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH '], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use('/orders', ordersRouter);
app.use("/auth", authRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
