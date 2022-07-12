require('dotenv').config();
require('express-async-errors');

//Security Packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');


//Swagger
const swaggerUI = require("swagger-ui-express")
const YAML = require('yamljs');
const swaggerDocument = YAML.load("./swagger.yaml")

const express = require('express');
const app = express();


const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');



const authRouter = require("./routes/auth")
const jobsRouter = require("./routes/jobs")

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set("trust proxy",1)
app.use(rateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
}))
app.use(express.json());
app.use(helmet())
app.use(cors())
app.use(xss())
// extra packages

// routes
app.get("/",(req,res) => {
  res.send('<h1>Jobs Api</h1> <a href ="/api-docs">Documentation</a>')
})

app.use("/api-docs", swaggerUI.serve,swaggerUI.setup(swaggerDocument))

app.use("/api/v1/auth",authRouter) 
app.use("/api/v1/jobs",authenticateUser,jobsRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware); 

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start(); 
