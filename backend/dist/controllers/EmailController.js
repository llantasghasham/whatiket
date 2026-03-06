"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCrmEmail = void 0;
const SendMail_1 = require("../helpers/SendMail");
const sendCrmEmail = async (req, res) => {
    try {
        const { nome, email, telefone, empresa, segmento, mensagem } = req.body;
        // Montar HTML do email
        const htmlContent = `
      <h2>Nova Solicitação de CRM Personalizado</h2>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefone:</strong> ${telefone}</p>
      <p><strong>Empresa:</strong> ${empresa}</p>
      <p><strong>Segmento:</strong> ${segmento}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${mensagem}</p>
      <hr>
      <p><small>Enviado via formulário do dashboard</small></p>
    `;
        // Usar a função SendMail existente
        await (0, SendMail_1.SendMail)({
            to: "autolavadoelpana@hotmail.com",
            subject: `Solicitação CRM - ${empresa}`,
            html: htmlContent
        });
        return res.status(200).json({ message: "Email enviado com sucesso!" });
    }
    catch (error) {
        console.error("Erro ao enviar email:", error);
        return res.status(500).json({ error: "Erro ao enviar email" });
    }
};
exports.sendCrmEmail = sendCrmEmail;
