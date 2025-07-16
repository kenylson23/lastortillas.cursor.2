import { RequestHandler } from 'express';
import { requireAuth } from './auth';
import { requireJWTAuth } from './jwtAuth';

/**
 * Middleware adaptativo que escolhe o sistema de autenticação
 * baseado no ambiente de execução
 */
export const adaptiveAuthMiddleware: RequestHandler = process.env.VERCEL 
  ? requireJWTAuth 
  : requireAuth;

/**
 * Middleware opcional adaptativo
 */
export const adaptiveOptionalAuth: RequestHandler = process.env.VERCEL
  ? (req, res, next) => {
      // Em serverless, sempre permitir mas tentar extrair user se token existe
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { verifyJWTToken } = require('./jwtAuth');
        const user = verifyJWTToken(token);
        if (user) {
          (req as any).user = user;
        }
      }
      next();
    }
  : require('./auth').optionalAuth;

/**
 * Função para escolher o handler de login correto
 */
export function getLoginHandler() {
  if (process.env.VERCEL) {
    return require('./jwtAuth').jwtLoginHandler;
  }
  return require('./auth').authenticateToken;
}

/**
 * Função para escolher o handler de logout correto
 */
export function getLogoutHandler() {
  if (process.env.VERCEL) {
    return require('./jwtAuth').jwtLogoutHandler;
  }
  return (req: any, res: any) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao fazer logout" });
        }
        res.json({ message: "Logout realizado com sucesso" });
      });
    } else {
      res.json({ message: "Logout realizado com sucesso" });
    }
  };
}

/**
 * Função para escolher o handler de verificação correto
 */
export function getVerifyHandler() {
  if (process.env.VERCEL) {
    return require('./jwtAuth').jwtVerifyHandler;
  }
  return (req: any, res: any) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: "Não autenticado" });
    }
  };
}