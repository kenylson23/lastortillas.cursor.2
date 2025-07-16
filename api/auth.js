// server/jwtAuth.ts
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
var JWT_SECRET = process.env.JWT_SECRET || "las-tortillas-secret-key-2025";
var JWT_EXPIRES_IN = "7d";
var ADMIN_CREDENTIALS = {
  username: "administrador",
  password: "$2b$10$F3nwbLcOBHurs1gIMzgZ7eWQL9VonoLa2UCPAqXaBFXTjc5Ya2kMC",
  // lasTortillas2025!
  id: 1,
  firstName: "Admin",
  lastName: "Las Tortillas",
  email: "admin@lastortillas.com",
  role: "admin"
};
function generateJWTToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyJWTToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
function requireJWTAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token n\xE3o fornecido" });
  }
  try {
    const payload = verifyJWTToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Token inv\xE1lido" });
    }
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Erro na verifica\xE7\xE3o do token" });
  }
}
async function jwtLoginHandler(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username e password s\xE3o obrigat\xF3rios" });
    }
    if (username === ADMIN_CREDENTIALS.username) {
      const isValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.password);
      if (!isValid) {
        return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
      }
      const payload = {
        id: ADMIN_CREDENTIALS.id,
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role
      };
      const token = generateJWTToken(payload);
      return res.json({
        token,
        user: payload,
        redirectTo: "/admin"
      });
    }
    return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
  } catch (error) {
    console.error("JWT Login error:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
function jwtLogoutHandler(req, res) {
  return res.json({ message: "Logout realizado com sucesso" });
}

// api/auth.ts
async function handler(req, res) {
  const { method, url } = req;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    if (method === "POST" && url?.includes("/login")) {
      return await jwtLoginHandler(req, res);
    }
    if (method === "POST" && url?.includes("/logout")) {
      return jwtLogoutHandler(req, res);
    }
    if (method === "GET" && url?.includes("/verify")) {
      return requireJWTAuth(req, res, () => {
        res.status(200).json({ user: req.user });
      });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
export {
  handler as default
};
