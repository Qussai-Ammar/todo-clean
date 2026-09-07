import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Using an insecure development default; set it in production.");
}

const app = createApp({ jwtSecret: JWT_SECRET });

app.listen(PORT, () => {
  console.log(`Todo app listening on http://localhost:${PORT}`);
});
