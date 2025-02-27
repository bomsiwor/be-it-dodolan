import express from "express";
import { env } from "./config";
import routes from "./routes";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

// Enable cors
app.use(cors());
app.use(bodyParser.json());

app.use("/api", routes);

app.listen(env.port, () => {
  console.log(`APP RUNNING AT PORT ${env.port}`);
});
