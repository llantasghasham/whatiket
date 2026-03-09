import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Whatsapp from "../models/Whatsapp";
import { getPageProfile, getAccessTokenFromPage, subscribeApp } from "../services/FacebookServices/graphAPI";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import ShowPlanService from "../services/PlanService/ShowPlanService";

export const facebookCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("HIT FACEBOOK CONTROLLER CALLBACK | ORIGINAL URL:", req.originalUrl, "| req.query:", JSON.stringify(req.query), "| req.headers.authorization:", req.headers.authorization ?? "MISSING");
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing authorization code" });
      return;
    }

    if (!state || typeof state !== "string") {
      res.status(400).json({ error: "Missing state parameter" });
      return;
    }

    const companyId = state;
    
    // Verificar se empresa existe e tem plano ativo
    const company = await ShowCompanyService(companyId);
    const plan = await ShowPlanService(company.planId);

    if (plan && plan.useFacebook === false) {
      console.warn("[Facebook OAuth] Plan useFacebook=false, allowing anyway");
    }

    const facebookAppId = process.env.FACEBOOK_APP_ID;
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
    const backendUrl = (process.env.BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:4000").replace(/\/$/, "");
    const redirectUri = `${backendUrl}/facebook-callback`;

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${facebookAppId}&client_secret=${facebookAppSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error("[Facebook OAuth] Erro ao obter access token:", JSON.stringify(tokenData));
      res.redirect(`${process.env.FRONTEND_URL}/canais?error=facebook-failed`);
      return;
    }

    const userToken = tokenData.access_token;

    const pagesResponse = await getPageProfile(tokenData.user_id || "me", userToken);
    const pages = Array.isArray(pagesResponse?.data) ? pagesResponse.data : [];

    if (pages.length === 0) {
      console.error("[Facebook OAuth] Nenhuma página encontrada");
      res.redirect(`${process.env.FRONTEND_URL}/canais?error=facebook-failed`);
      return;
    }

    const io = getIO();
    const createdConnections = [];

    for (const page of pages) {
      const { name, access_token, id, instagram_business_account } = page;
      const pageToken = await getAccessTokenFromPage(access_token);

      let facebookConnection;
      const existFb = await Whatsapp.findOne({ where: { facebookPageUserId: id, channel: "facebook", companyId } });
      if (existFb) {
        await existFb.update({
          facebookUserId: tokenData.user_id || "me",
          facebookUserToken: pageToken,
          tokenMeta: userToken,
          status: "CONNECTED",
        });
        facebookConnection = existFb;
      } else {
        facebookConnection = await Whatsapp.create({
          companyId,
          name: `FB ${name}`,
          facebookUserId: tokenData.user_id || "me",
          facebookPageUserId: id,
          facebookUserToken: pageToken,
          tokenMeta: userToken,
          isDefault: false,
          channel: "facebook",
          status: "CONNECTED",
          greetingMessage: "",
          farewellMessage: "",
          queueIds: [],
          isMultidevice: false
        });
      }

      await subscribeApp(id, pageToken);
      createdConnections.push(facebookConnection);

      if (instagram_business_account) {
        const { id: instagramId, username, name: instagramName } = instagram_business_account;

        let instagramConnection;
        const existIg = await Whatsapp.findOne({ where: { facebookPageUserId: instagramId, channel: "instagram", companyId } });
        if (existIg) {
          await existIg.update({
            facebookUserToken: pageToken,
            tokenMeta: userToken,
            status: "CONNECTED",
          });
          instagramConnection = existIg;
        } else {
          instagramConnection = await Whatsapp.create({
            companyId,
            name: `Insta ${username || instagramName}`,
            facebookUserId: tokenData.user_id || "me",
            facebookPageUserId: instagramId,
            facebookUserToken: pageToken,
            tokenMeta: userToken,
            isDefault: false,
            channel: "instagram",
            status: "CONNECTED",
            greetingMessage: "",
            farewellMessage: "",
            queueIds: [],
            isMultidevice: false
          });
        }
        createdConnections.push(instagramConnection);
      }
    }

    createdConnections.forEach((conn) => {
      io.of(String(companyId)).emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp: conn
      });
    });

    res.redirect(`${process.env.FRONTEND_URL}/canais?success=facebook-connected`);

  } catch (error) {
    console.error("Erro no Facebook OAuth callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/canais?error=facebook-failed`);
  }
};

export const instagramCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, state } = req.query;
    
    console.log("Instagram OAuth Callback - code:", code ? "present" : "missing");
    console.log("Instagram OAuth Callback - state:", state);

    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing authorization code" });
      return;
    }

    if (!state || typeof state !== "string") {
      res.status(400).json({ error: "Missing state parameter" });
      return;
    }

    const companyId = state;
    
    // Verificar se empresa existe e tem plano ativo
    const company = await ShowCompanyService(companyId);
    const plan = await ShowPlanService(company.planId);

    if (plan && plan.useInstagram === false) {
      console.warn("[Instagram OAuth] Plan useInstagram=false, allowing anyway");
    }

    const facebookAppId = process.env.FACEBOOK_APP_ID;
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
    const backendUrl = (process.env.BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:4000").replace(/\/$/, "");
    const redirectUri = `${backendUrl}/instagram-callback`;

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${facebookAppId}&client_secret=${facebookAppSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error("[Instagram OAuth] Erro ao obter access token:", JSON.stringify(tokenData));
      res.redirect(`${process.env.FRONTEND_URL}/canais?error=instagram-failed`);
      return;
    }

    const userToken = tokenData.access_token;

    const pagesResponse = await getPageProfile(tokenData.user_id || "me", userToken);
    const pages = Array.isArray(pagesResponse?.data) ? pagesResponse.data : [];

    if (pages.length === 0) {
      console.error("[Instagram OAuth] Nenhuma página com Instagram encontrada");
      res.redirect(`${process.env.FRONTEND_URL}/canais?error=instagram-failed`);
      return;
    }

    const io = getIO();
    const createdConnections = [];

    for (const page of pages) {
      const { name, access_token, id, instagram_business_account } = page;

      // Apenas criar se tiver Instagram Business
      if (instagram_business_account) {
        const { id: instagramId, username, name: instagramName } = instagram_business_account;
        const pageToken = await getAccessTokenFromPage(access_token);

        let instagramConnection;
        const existIg = await Whatsapp.findOne({ where: { facebookPageUserId: instagramId, channel: "instagram", companyId } });
        if (existIg) {
          await existIg.update({
            facebookUserToken: pageToken,
            tokenMeta: userToken,
            status: "CONNECTED",
          });
          instagramConnection = existIg;
        } else {
          instagramConnection = await Whatsapp.create({
            companyId,
            name: `Insta ${username || instagramName}`,
            facebookUserId: tokenData.user_id || "me",
            facebookPageUserId: instagramId,
            facebookUserToken: pageToken,
            tokenMeta: userToken,
            isDefault: false,
            channel: "instagram",
            status: "CONNECTED",
            greetingMessage: "",
            farewellMessage: "",
            queueIds: [],
            isMultidevice: false
          });
        }
        createdConnections.push(instagramConnection);
        await subscribeApp(id, pageToken);
      }
    }

    if (createdConnections.length === 0) {
      console.error("[Instagram OAuth] Nenhuma conta Instagram Business encontrada");
      res.redirect(`${process.env.FRONTEND_URL}/canais?error=instagram-failed`);
      return;
    }

    createdConnections.forEach((conn) => {
      io.of(String(companyId)).emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp: conn
      });
    });

    // Redirecionar para frontend com sucesso
    res.redirect(`${process.env.FRONTEND_URL}/canais?success=instagram-connected`);

  } catch (error) {
    console.error("Erro no Instagram OAuth callback:", error);
    res.redirect(`${process.env.FRONTEND_URL}/canais?error=instagram-failed`);
  }
};
