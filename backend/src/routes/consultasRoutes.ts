import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as dotenv from "dotenv";

dotenv.config();

const router = Router();

// Endpoint para proxy de consultas da API externa
router.post("/consultas", isAuth, async (req, res) => {
  try {
    console.log("[PROXY] POST /consultas - Requisição recebida");
    console.log("[PROXY] Método:", req.method);
    console.log("[PROXY] URL:", req.originalUrl);
    console.log("[PROXY] Headers:", req.headers);
    console.log("[PROXY] Body:", req.body);
    console.log("[PROXY] Query params:", req.query);
    
    const { placa, link } = req.body;
    const apiKey = req.headers.authorization?.replace('Bearer ', '');

    console.log("[PROXY] Recebendo requisição:", { placa, link });
    console.log("[PROXY] Usando token:", apiKey ? `${apiKey.substring(0, 10)}...` : "Não encontrado");

    if (!placa || !link) {
      return res.status(400).json({ 
        status: "erro",
        mensagem: "Parâmetros 'placa' e 'link' são obrigatórios"
      });
    }

    if (!apiKey) {
      return res.status(401).json({ 
        status: "erro", 
        mensagem: "Token de autenticación no proporcionado"
      });
    }

    // Fazer requisição para API externa
    const requestBody = {
      placa: placa.toUpperCase(),
      link: link
    };

    console.log("[PROXY] Enviando para API externa:", requestBody);

    const response = await fetch(`https://api.apifull.com.br/api/fipe`, {
      method: 'POST',
      headers: {
        'Authorization': `${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log("[PROXY] Dados recebidos:", data);
    
    // Retornar resposta exata da API externa
    res.status(response.status).json(data);

  } catch (error) {
    console.error("[PROXY] Erro na requisição:", error);
    res.status(500).json({ 
      status: "erro",
      mensagem: "Erro interno no proxy de consultas",
      erro: error.message
    });
  }
});

// Rota de teste para conectar na API externa
router.post("/test-external", async (req, res) => {
  try {
    console.log("[TEST-EXTERNAL] Tentando conectar na API externa...");
    
    const response = await fetch(`https://api.apifull.com.br/api/fipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ placa: "TEST123", link: "fipe" })
    });

    console.log("[TEST-EXTERNAL] Status:", response.status);
    console.log("[TEST-EXTERNAL] Headers:", response.headers);
    
    const data = await response.text();
    console.log("[TEST-EXTERNAL] Response:", data);
    
    res.json({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      response: data
    });
    
  } catch (error) {
    console.error("[TEST-EXTERNAL] Erro:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Rota de teste para debug do token
router.post("/test-token", async (req, res) => {
  console.log("[TEST-TOKEN] Headers completos:", req.headers);
  console.log("[TEST-TOKEN] Authorization header:", req.headers.authorization);
  console.log("[TEST-TOKEN] Token extraído:", req.headers.authorization);
  console.log("[TEST-TOKEN] Body:", req.body);
  
  res.json({
    status: "sucesso",
    headers: req.headers,
    authorization: req.headers.authorization,
    token: req.headers.authorization,
    body: req.body
  });
});

// Rota de teste simples sem autenticação
router.get("/ping", async (req, res) => {
  console.log("[PING] Rota /ping chamada");
  res.json({ 
    status: "sucesso",
    mensagem: "Backend está funcionando",
    timestamp: new Date().toISOString()
  });
});

// Rota de teste sem autenticação para isolar o problema
router.get("/test", async (req, res) => {
  console.log("[TEST] Rota /test chamada sem autenticação");
  res.json({ 
    status: "sucesso",
    mensagem: "Rota de teste funcionando",
    timestamp: new Date().toISOString()
  });
});

// Rota de teste para verificar se o proxy está funcionando
router.get("/fipe", async (req, res) => {
  console.log("[PROXY] GET /fipe - Teste de conexão");
  res.json({ 
    status: "sucesso",
    mensagem: "Proxy FIPE está funcionando",
    timestamp: new Date().toISOString()
  });
});

// Endpoint para proxy de consultas da API externa (sem isAuth temporariamente)
router.post("/fipe", async (req, res) => {
  try {
    console.log("[PROXY] POST /fipe - Requisição recebida SEM AUTH");
    console.log("[PROXY] Método:", req.method);
    console.log("[PROXY] URL:", req.originalUrl);
    console.log("[PROXY] Headers:", req.headers);
    console.log("[PROXY] Body:", req.body);
    console.log("[PROXY] Query params:", req.query);
    
    const { placa, link } = req.body;
    const apiKey = req.headers.authorization;

    console.log("[PROXY] Recebendo requisição:", { placa, link });
    console.log("[PROXY] Header Authorization completo:", req.headers.authorization);
    console.log("[PROXY] Token extraído:", apiKey);
    console.log("[PROXY] Token length:", apiKey ? apiKey.length : 0);
    console.log("[PROXY] Token first 20 chars:", apiKey ? apiKey.substring(0, 20) : "N/A");

    if (!placa || !link) {
      return res.status(400).json({ 
        status: "erro",
        mensagem: "Parâmetros 'placa' e 'link' são obrigatórios"
      });
    }

    if (!apiKey) {
      return res.status(401).json({ 
        status: "erro", 
        mensagem: "Token de autenticación no proporcionado"
      });
    }

    // Fazer requisição para API externa
    const requestBody = {
      placa: placa.toUpperCase(),
      link: link
    };

    console.log("[PROXY] Enviando para API externa:", requestBody);

    const response = await fetch(`https://api.apifull.com.br/api/fipe`, {
      method: 'POST',
      headers: {
        'Authorization': `${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log("[PROXY] Dados recebidos:", data);
    
    // Retornar resposta exata da API externa
    res.status(response.status).json(data);

  } catch (error) {
    console.error("[PROXY] Erro na requisição:", error);
    res.status(500).json({ 
      status: "erro",
      mensagem: "Erro interno no proxy de consultas",
      erro: error.message
    });
  }
});

// Rota catch-all para debug
router.use("/fipe", async (req, res, next) => {
  console.log("[PROXY] Catch-all - Requisição recebida");
  console.log("[PROXY] Método:", req.method);
  console.log("[PROXY] URL:", req.originalUrl);
  console.log("[PROXY] Headers:", req.headers);
  console.log("[PROXY] Body:", req.body);
  console.log("[PROXY] Query params:", req.query);
  
  // Se for POST, processa normalmente
  if (req.method === 'POST') {
    return next();
  }
  
  // Se for GET, retorna o teste
  res.json({ 
    status: "sucesso",
    mensagem: "Rota catch-all funcionando",
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

export default router;
