require('dotenv').config();
require('express-async-errors')

const express = require('express')
const app = express()

const connectDB = require('./db/connect')

//routes
const authRouter = require('./routes/authRouter')
const audioRouter = require('./routes/audioRouter')
const userRouter = require('./routes/userRouter')
//packages
const cookieParser = require("cookie-parser");
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize')






app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize())

app.use(express.json());
app.use(cookieParser("SECRET_KEY"))


app.get('/', (req, res) => {
    res.send('hello world')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/files', audioRouter)
app.use('/api/v1/users', userRouter)

const port = 6000
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

