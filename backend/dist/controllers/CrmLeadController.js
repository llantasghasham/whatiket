"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.convert = exports.update = exports.show = exports.store = exports.index = void 0;
const CreateCrmLeadService_1 = __importDefault(require("../services/CrmLeadService/CreateCrmLeadService"));
const ListCrmLeadsService_1 = __importDefault(require("../services/CrmLeadService/ListCrmLeadsService"));
const ShowCrmLeadService_1 = __importDefault(require("../services/CrmLeadService/ShowCrmLeadService"));
const UpdateCrmLeadService_1 = __importDefault(require("../services/CrmLeadService/UpdateCrmLeadService"));
const DeleteCrmLeadService_1 = __importDefault(require("../services/CrmLeadService/DeleteCrmLeadService"));
const ConvertCrmLeadService_1 = __importDefault(require("../services/CrmLeadService/ConvertCrmLeadService"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { searchParam, status, ownerUserId, pageNumber, limit } = req.query;
    const result = await (0, ListCrmLeadsService_1.default)({
        companyId,
        searchParam,
        status,
        ownerUserId: ownerUserId ? Number(ownerUserId) : undefined,
        pageNumber: pageNumber ? Number(pageNumber) : undefined,
        limit: limit ? Number(limit) : undefined
    });
    return res.json(result);
};
exports.index = index;
const store = async (req, res) => {
    const { companyId } = req.user;
    const data = req.body;
    // Capturar UTMs da requisição (query params)
    const utmSource = req.query.utm_source;
    const utmMedium = req.query.utm_medium;
    const utmCampaign = req.query.utm_campaign;
    const utmTerm = req.query.utm_term;
    const utmContent = req.query.utm_content;
    // **CORREÇÃO: Não sobreescrever campos do frontend**
    let source = data.source;
    let campaign = data.campaign;
    let medium = data.medium;
    // **Apenas usa UTM se não tiver dados do frontend**
    if (!source && !campaign && (utmSource || utmMedium || utmCampaign)) {
        const utmParams = [];
        if (utmSource)
            utmParams.push(`source: ${utmSource}`);
        if (utmMedium)
            utmParams.push(`medium: ${utmMedium}`);
        if (utmCampaign)
            utmParams.push(`campaign: ${utmCampaign}`);
        if (utmTerm)
            utmParams.push(`term: ${utmTerm}`);
        if (utmContent)
            utmParams.push(`content: ${utmContent}`);
        source = `UTM: ${utmParams.join(' | ')}`;
        campaign = utmCampaign || campaign;
        medium = utmMedium || medium;
    }
    const lead = await (0, CreateCrmLeadService_1.default)({
        ...data,
        source,
        campaign,
        medium,
        companyId
    });
    return res.status(201).json(lead);
};
exports.store = store;
const show = async (req, res) => {
    const { companyId } = req.user;
    const { leadId } = req.params;
    const lead = await (0, ShowCrmLeadService_1.default)({
        id: Number(leadId),
        companyId
    });
    return res.json(lead);
};
exports.show = show;
const update = async (req, res) => {
    const { companyId } = req.user;
    const { leadId } = req.params;
    const data = req.body;
    const lead = await (0, UpdateCrmLeadService_1.default)({
        id: Number(leadId),
        companyId,
        ...data
    });
    return res.json(lead);
};
exports.update = update;
const convert = async (req, res) => {
    const { companyId } = req.user;
    const { leadId } = req.params;
    const { contactId, phone, primaryTicketId } = req.body;
    const { lead, client } = await (0, ConvertCrmLeadService_1.default)({
        leadId: Number(leadId),
        companyId,
        contactId,
        phone,
        primaryTicketId
    });
    return res.json({ lead, client });
};
exports.convert = convert;
const remove = async (req, res) => {
    const { companyId } = req.user;
    const { leadId } = req.params;
    await (0, DeleteCrmLeadService_1.default)({
        id: Number(leadId),
        companyId
    });
    return res.status(204).send();
};
exports.remove = remove;
