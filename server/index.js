import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import connectToDB from "./config/connectToDB.js";
import notFound from "./middlewares/errorHandlers/notFound.js";
import errorHandler from "./middlewares/errorHandlers/errorHandler.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";
import http from "http";

import groupRouter from "./routes/group.route .js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import initializeSocket from "./socket.js";

const app = express();

// localization
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en", // Correct option to set the fallback language
    backend: {
      loadPath: "./locales/{{lng}}/translation.json", // Path for translations
    },
  });
app.use(middleware.handle(i18next));

// http server
const server = http.createServer(app);

// websocket server
initializeSocket(server);

// variable environment
dotenv.config();

// connect to database and then start the server
connectToDB()
  .then(() => {
    server.listen(process.env.PORT, () =>
      console.log(`Server is running on port ${process.env.PORT}.`)
    );
  })
  .catch((err) => {
    console.error(err.name, err.message);
    process.exit(1);
  });

// middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// logger
app.use(morgan("dev"));

// user routes
app.use("/api/users", userRouter);
// message routes
app.use("/api/messages", messageRouter);
// group routes
app.use("/api/groups", groupRouter);

// error handling
app.all("*", notFound);
app.use(errorHandler);

// handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});
