import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  CircularProgress
} from "@material-ui/core";
import { toast } from "react-toastify";

import api from "../../services/api";
import {
  createFinanceiroFatura,
  updateFinanceiroFatura
} from "../../services/financeiroFaturas";
import { listServiceOrders } from "../../services/serviceOrdersService";
import { listFinanceiroCategorias } from "../../services/financeiroCategorias";
import { listFinanceiroFornecedores } from "../../services/financeiroFornecedores";

import toastError from "../../errors/toastError";

const STATUS_OPTIONS = [
  { value: "aberta", label: "Aberta" },
  { value: "paga", label: "Paga" },
  { value: "vencida", label: "Vencida" },
  { value: "cancelada", label: "Cancelada" }
];

const RECURRENCE_OPTIONS = [
  { value: "unica", label: "Única" },
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" }
];

const REFERENCIA_OPTIONS = [
  { value: "", label: "Sem referência" },
  { value: "servico", label: "Serviço" },
  { value: "produto", label: "Produto" },
  { value: "ordem_servico", label: "Ordem de serviço" }
];

const PAYMENT_PROVIDER_OPTIONS = [
  { value: "", label: "Não gerar link" },
  { value: "asaas", label: "Asaas" },
  { value: "mercadopago", label: "Mercado Pago" }
];

const DEFAULT_FORM = {
  clientId: "",
  descricao: "",
  valor: "",
  status: "aberta",
  dataVencimento: "",
  dataPagamento: "",
  tipoRecorrencia: "unica",
  quantidadeCiclos: "",
  observacoes: "",
  ativa: true,
  gerarContasReceber: false,
  categoriaId: "",
  fornecedorId: "",
  tipoReferencia: "",
  referenciaId: "",
  paymentProvider: ""
};

const FaturaModal = ({ open, onClose, fatura, onSaved, initialData }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [references, setReferences] = useState([]);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const preselectedClient = useMemo(() => fatura?.client || initialData?.client || null, [fatura, initialData]);

  useEffect(() => {
    if (!open || !form.gerarContasReceber) return;

    const load = async () => {
      try {
        const [categoriasResp, fornecedoresResp] = await Promise.all([
          listFinanceiroCategorias({ tipo: "receita", ativa: true, pageNumber: 1 }),
          listFinanceiroFornecedores()
        ]);

        console.log("[DEBUG] Categorias API response:", categoriasResp);
        const categoriasData = Array.isArray(categoriasResp)
          ? categoriasResp
          : categoriasResp?.categorias || categoriasResp?.rows || categoriasResp?.records || [];

        console.log("[DEBUG] Categorias parsed:", categoriasData);

        console.log("[DEBUG] Fornecedores API response:", fornecedoresResp);
        const fornecedoresData = Array.isArray(fornecedoresResp)
          ? fornecedoresResp
          : fornecedoresResp?.fornecedores || fornecedoresResp?.records || [];

        console.log("[DEBUG] Fornecedores parsed:", fornecedoresData);

        // Fallback: se não vier categorias de receita, buscar todas as categorias ativas
        if (categoriasData.length === 0) {
          console.log("[DEBUG] Sem categorias de receita, buscando todas categorias...");
          try {
            const todasResp = await listFinanceiroCategorias({ ativa: true, pageNumber: 1 });
            console.log("[DEBUG] Todas categorias API response:", todasResp);
            const todasData = Array.isArray(todasResp)
              ? todasResp
              : todasResp?.categorias || todasResp?.rows || todasResp?.records || [];
            console.log("[DEBUG] Todas categorias parsed:", todasData);
            setCategorias(todasData);
          } catch (fallbackErr) {
            console.error("[DEBUG] Erro no fallback:", fallbackErr);
            setCategorias([]);
          }
        } else {
          setCategorias(categoriasData);
        }

        setFornecedores(fornecedoresData);
      } catch (err) {
        toastError(err);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form.gerarContasReceber]);

  useEffect(() => {
    if (open) {
      setClientSearch("");
      fetchClients("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const debounce = setTimeout(() => {
      fetchClients(clientSearch);
    }, 300);

    return () => clearTimeout(debounce);
  }, [clientSearch, open]);

  useEffect(() => {
    if (fatura && open) {
      const nextForm = {
        clientId: fatura.clientId ? String(fatura.clientId) : "",
        descricao: fatura.descricao || "",
        valor:
          fatura.valor != null
            ? String(Number(fatura.valor).toFixed(2))
            : "",
        status: fatura.status || "aberta",
        dataVencimento: fatura.dataVencimento
          ? String(fatura.dataVencimento).substring(0, 10)
          : "",
        dataPagamento: fatura.dataPagamento
          ? String(fatura.dataPagamento).substring(0, 10)
          : "",
        tipoRecorrencia: fatura.tipoRecorrencia || "unica",
        quantidadeCiclos:
          fatura.quantidadeCiclos != null
            ? String(fatura.quantidadeCiclos)
            : "",
        observacoes: fatura.observacoes || "",
        ativa: typeof fatura.ativa === "boolean" ? fatura.ativa : true,
        gerarContasReceber:
          typeof fatura.gerarContasReceber === "boolean"
            ? fatura.gerarContasReceber
            : false,
        categoriaId: fatura.categoriaId ? String(fatura.categoriaId) : "",
        fornecedorId: fatura.fornecedorId ? String(fatura.fornecedorId) : "",
        tipoReferencia: fatura.tipoReferencia || "",
        referenciaId: fatura.referenciaId ? String(fatura.referenciaId) : "",
        paymentProvider: fatura.paymentProvider || ""
      };
      setForm(nextForm);

      if (fatura.client) {
        setClients(prev => {
          const exists = prev.find(item => item.id === fatura.client.id);
          if (exists) {
            return prev;
          }
          return [fatura.client, ...prev];
        });
      }
    } else if (open && initialData) {
      // Preencher com dados iniciais do projeto
      const nextForm = {
        ...DEFAULT_FORM,
        clientId: initialData.clientId ? String(initialData.clientId) : "",
        descricao: initialData.descricao || "",
        tipoReferencia: initialData.tipoReferencia || "",
        referenciaId: initialData.referenciaId ? String(initialData.referenciaId) : "",
        valor: initialData.valor ? String(Number(initialData.valor).toFixed(2)) : ""
      };
      setForm(nextForm);
      
      if (initialData.client) {
        setClients(prev => {
          const exists = prev.find(item => item.id === initialData.client.id);
          if (exists) return prev;
          return [initialData.client, ...prev];
        });
      }
    } else if (open) {
      setForm(DEFAULT_FORM );
    }
  }, [fatura, open, initialData]);

  const clientOptions = useMemo(
    () => clients || [],
    [clients]
  );

  const filteredClientOptions = useMemo(() => {
    if (!clientSearch) {
      return clientOptions;
    }
    const term = clientSearch.toLowerCase();
    return clientOptions.filter(client => {
      const values = [
        client.name,
        client.companyName,
        client.document,
        client.email,
        client.phone
      ]
        .filter(Boolean)
        .map(value => String(value).toLowerCase());
      return values.some(value => value.includes(term));
    });
  }, [clientOptions, clientSearch]);

  const fetchClients = async (search = "") => {
    try {
      setClientsLoading(true);
      const { data } = await api.get("/crm/clients", {
        params: { searchParam: search, pageNumber: 1 }
      });
      const baseList = data.clients || data.records || data;
      let list = Array.isArray(baseList) ? [...baseList] : [];

      if (preselectedClient && !list.some(item => item.id === preselectedClient.id)) {
        list = [preselectedClient, ...list];
      }

      setClients(list);
    } catch (err) {
      toastError(err);
    } finally {
      setClientsLoading(false);
    }
  };

  const formatCurrency = value => {
    const number = Number(value) || 0;
    return number.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  const fetchReferences = async tipo => {
    if (!tipo) {
      setReferences([]);
      return;
    }

    try {
      setReferencesLoading(true);
      let list = [];

      if (tipo === "produto" || tipo === "servico") {
        const endpoint = tipo === "produto" ? "/produtos" : "/servicos";
        const { data } = await api.get(endpoint);
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data.records)) {
          list = data.records;
        } else if (Array.isArray(data.produtos)) {
          list = data.produtos;
        }
      } else if (tipo === "ordem_servico") {
        const data = await listServiceOrders({ pageNumber: 1, limit: 100 });
        list = data.serviceOrders || [];
      }

      setReferences(list);
    } catch (err) {
      toastError(err);
    } finally {
      setReferencesLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (!form.tipoReferencia) {
      setReferences([]);
      setForm(prev => ({ ...prev, referenciaId: "" }));
      return;
    }

    const loadReferences = async () => {
      await fetchReferences(form.tipoReferencia);
      if (initialData?.tipoReferencia === form.tipoReferencia && initialData?.referenciaId) {
        setForm(prev => ({ ...prev, referenciaId: String(initialData.referenciaId) }));
      }
    };

    loadReferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tipoReferencia, open]);

  const handleChange = field => event => {
    let value;
    if (field === "ativa" || field === "gerarContasReceber") {
      value = event.target.checked;
    } else {
      value = event.target.value;
    }

    setForm(prev => {
      const nextState = {
        ...prev,
        [field]: value
      };

      if (field === "tipoReferencia") {
        nextState.referenciaId = "";
      }

      if (field === "referenciaId") {
        const selected = references.find(item => String(item.id) === String(value));
        if (selected) {
          if (form.tipoReferencia === "ordem_servico") {
            nextState.valor = String(Number(selected.total ?? 0).toFixed(2));
            nextState.descricao = nextState.descricao || `Ordem de Serviço #${selected.id}`;
          } else if (selected.valor != null) {
            nextState.valor = String(Number(selected.valor).toFixed(2));
          }
        }
      }

      return nextState;
    });
  };

  const handleClose = () => {
    if (loading) return;
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!form.clientId) {
      toast.error("Selecione um cliente.");
      return;
    }

    if (!form.descricao) {
      toast.error("Informe a descrição da fatura.");
      return;
    }

    if (!form.valor) {
      toast.error("Informe o valor da fatura.");
      return;
    }

    if (!form.dataVencimento) {
      toast.error("Informe a data de vencimento.");
      return;
    }

    if (
      (form.tipoReferencia && !form.referenciaId) ||
      (!form.tipoReferencia && form.referenciaId)
    ) {
      toast.error("Selecione o item referente ou limpe o tipo de referência.");
      return;
    }

    const payload = {
      clientId: Number(form.clientId),
      descricao: form.descricao,
      valor: Number(String(form.valor).replace(",", ".")),
      status: form.status,
      dataVencimento: form.dataVencimento,
      dataPagamento: form.dataPagamento || undefined,
      tipoRecorrencia: form.tipoRecorrencia,
      quantidadeCiclos: form.quantidadeCiclos
        ? Number(form.quantidadeCiclos)
        : undefined,
      observacoes: form.observacoes || undefined,
      ativa: form.ativa,
      tipoReferencia: form.tipoReferencia || undefined,
      referenciaId: form.referenciaId
        ? Number(form.referenciaId)
        : undefined,
      paymentProvider: form.paymentProvider || undefined,
      categoriaId: form.categoriaId ? Number(form.categoriaId) : undefined,
      fornecedorId: form.fornecedorId ? Number(form.fornecedorId) : undefined,
      projectId: initialData?.projectId || undefined
    };

    try {
      setLoading(true);
      const response = fatura && fatura.id
        ? await updateFinanceiroFatura(fatura.id, payload)
        : await createFinanceiroFatura(payload);

      toast.success(
        fatura && fatura.id
          ? "Fatura atualizada com sucesso"
          : "Fatura criada com sucesso"
      );

      if (onSaved) {
        onSaved(response);
      }

      handleClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="fatura-dialog-title"
    >
      <DialogTitle id="fatura-dialog-title">
        {fatura && fatura.id ? "Editar Fatura" : "Nova Fatura"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Buscar cliente"
              fullWidth
              value={clientSearch}
              onChange={event => setClientSearch(event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              margin="dense"
              label="Cliente"
              fullWidth
              value={form.clientId}
              onChange={handleChange("clientId")}
              SelectProps={{
                displayEmpty: true
              }}
            >
              <MenuItem value="">
                <em>Selecione um cliente</em>
              </MenuItem>
              {filteredClientOptions.map(client => (
                <MenuItem key={client.id} value={String(client.id)}>
                  {client.name ||
                    client.companyName ||
                    `Cliente #${client.id}`}{" "}
                  {client.document ? `• ${client.document}` : ""}{" "}
                  {client.email ? `• ${client.email}` : ""}
                </MenuItem>
              ))}
            </TextField>
            {clientsLoading && (
              <CircularProgress size={18} style={{ marginLeft: 8 }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Valor ($)"
              type="number"
              fullWidth
              value={form.valor}
              onChange={handleChange("valor")}
              inputProps={{ min: "0", step: "0.01" }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Descrição"
              fullWidth
              multiline
              minRows={2}
              required
              value={form.descricao}
              onChange={handleChange("descricao")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              margin="dense"
              label="Tipo de referência"
              fullWidth
              value={form.tipoReferencia}
              onChange={handleChange("tipoReferencia")}
            >
              {REFERENCIA_OPTIONS.map(option => (
                <MenuItem key={option.value || "none"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              margin="dense"
              label={
                form.tipoReferencia === "ordem_servico"
                  ? "Ordem de serviço"
                  : "Serviço ou produto"
              }
              fullWidth
              value={form.referenciaId}
              onChange={handleChange("referenciaId")}
              disabled={!form.tipoReferencia || referencesLoading}
            >
              <MenuItem value="">
                <em>
                  {form.tipoReferencia
                    ? referencesLoading
                      ? "Carregando..."
                      : "Selecione uma opção"
                    : "Selecione o tipo de referência"}
                </em>
              </MenuItem>
              {references.map(item => {
                let label = item.nome || item.name || item.descricao || `#${item.id}`;
                if (form.tipoReferencia === "ordem_servico") {
                  const customerName = item.customer?.name || "Cliente não informado";
                  label = `OS #${item.id} • ${customerName} • ${formatCurrency(item.total)}`;
                } else if (item.valor != null) {
                  label = `${label} - ${formatCurrency(item.valor)}`;
                }
                return (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {label}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              margin="dense"
              label="Status"
              fullWidth
              value={form.status}
              onChange={handleChange("status")}
            >
              {STATUS_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              margin="dense"
              label="Gateway de pagamento"
              fullWidth
              value={form.paymentProvider}
              onChange={handleChange("paymentProvider")}
            >
              {PAYMENT_PROVIDER_OPTIONS.map(option => (
                <MenuItem key={option.value || "none"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Data de Vencimento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.dataVencimento}
              onChange={handleChange("dataVencimento")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Data de Pagamento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.dataPagamento}
              onChange={handleChange("dataPagamento")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              margin="dense"
              label="Recorrência"
              fullWidth
              value={form.tipoRecorrencia}
              onChange={handleChange("tipoRecorrencia")}
            >
              {RECURRENCE_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {form.tipoRecorrencia !== "unica" && (
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Quantidade de ciclos"
                type="number"
                fullWidth
                value={form.quantidadeCiclos}
                onChange={handleChange("quantidadeCiclos")}
                inputProps={{ min: "1" }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Observações"
              fullWidth
              multiline
              rows={3}
              value={form.observacoes}
              onChange={handleChange("observacoes")}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.ativa}
                      onChange={handleChange("ativa")}
                      color="primary"
                    />
                  }
                  label="Fatura ativa"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.gerarContasReceber}
                      onChange={handleChange("gerarContasReceber")}
                      color="primary"
                    />
                  }
                  label="Gerar contas a receber"
                />
              </Grid>
            </Grid>
          </Grid>

          {form.gerarContasReceber && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  margin="dense"
                  label="Categoria"
                  fullWidth
                  value={form.categoriaId}
                  onChange={handleChange("categoriaId")}
                >
                  <MenuItem value="">
                    <em>Selecione uma categoria</em>
                  </MenuItem>
                  {categorias.length === 0 ? (
                    <MenuItem disabled>
                      <em>Nenhuma categoria encontrada</em>
                    </MenuItem>
                  ) : (
                    categorias.map(categoria => (
                      <MenuItem key={categoria.id} value={String(categoria.id)}>
                        {categoria.nome} ({categoria.tipo})
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  margin="dense"
                  label="Fornecedor"
                  fullWidth
                  value={form.fornecedorId}
                  onChange={handleChange("fornecedorId")}
                >
                  <MenuItem value="">
                    <em>Selecione um fornecedor</em>
                  </MenuItem>
                  {fornecedores.map(fornecedor => (
                    <MenuItem key={fornecedor.id} value={String(fornecedor.id)}>
                      {fornecedor.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="default" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FaturaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fatura: PropTypes.object,
  onSaved: PropTypes.func
};

export default FaturaModal;