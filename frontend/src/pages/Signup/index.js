import React, { useState, useEffect, useContext } from "react";
import qs from "query-string";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";

import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import ColorModeContext from "../../layout/themeContext";

const UserSchema = Yup.object().shape({
  name: Yup.string().min(2).max(50).required("Requerido"),
  companyName: Yup.string().min(2).max(50).required("Requerido"),
  password: Yup.string().min(5).max(50),
  email: Yup.string().email("Correo inválido").required("Requerido"),
  phone: Yup.string().required("Requerido"),
  planId: Yup.string().required("Seleccione un plan"),
});

function SignUp() {
  const { colorMode } = useContext(ColorModeContext);
  const { logo } = colorMode;
  const history = useHistory();
  const { getPlanList } = usePlans();
  
  const [plans, setPlans] = useState([]);
  const [openPlans, setOpenPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    text: '',
    color: '',
    percentage: 0
  });
  const [whatsappPopupActive, setWhatsappPopupActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formikHelpers, setFormikHelpers] = useState(null);

  const params = qs.parse(window.location.search);
  const companyId = params.companyId || null;

  const initialState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId,
    companyName: "",
    planId: "",
  };

  // Aplicar tema idêntico ao login
  useEffect(() => {
    document.title = "Registro - Whaticket Pro";
    
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      body {
        background: #050A1B !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        position: relative;
        overflow: hidden;
        margin: 0;
        padding: 0;
      }
      
      .lights-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      }
      
      .light {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        animation: float 6s ease-in-out infinite;
      }
      
      .light:nth-child(1) {
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%);
        top: 15%;
        left: 5%;
        animation-delay: 0s;
      }
      
      .light:nth-child(2) {
        width: 180px;
        height: 180px;
        background: radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(219, 39, 119, 0.15) 50%, transparent 70%);
        top: 55%;
        right: 10%;
        animation-delay: 2s;
      }
      
      .light:nth-child(3) {
        width: 120px;
        height: 120px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 70%);
        bottom: 25%;
        left: 15%;
        animation-delay: 4s;
      }
      
      .light:nth-child(4) {
        width: 160px;
        height: 160px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 50%, transparent 70%);
        top: 40%;
        left: 50%;
        animation-delay: 1s;
      }
      
      .light:nth-child(5) {
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 50%, transparent 70%);
        bottom: 10%;
        right: 30%;
        animation-delay: 3s;
      }
      
      .light:nth-child(6) {
        width: 140px;
        height: 140px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(79, 70, 229, 0.15) 50%, transparent 70%);
        top: 5%;
        right: 25%;
        animation-delay: 5s;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        25% { transform: translateY(-20px) translateX(10px); }
        50% { transform: translateY(-10px) translateX(-10px); }
        75% { transform: translateY(-30px) translateX(5px); }
      }
      
      .geometric-shapes {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      }
      
      .shape {
        position: absolute;
      }
      
      .rotating-square {
        width: 80px;
        height: 80px;
        border: 1px solid;
        background: transparent;
        animation: spin 8s linear infinite;
        filter: drop-shadow(0 0 8px currentColor);
      }
      
      .square1 {
        color: rgba(168, 85, 247, 0.4);
        border-color: rgba(168, 85, 247, 0.4);
        top: 15%;
        left: 8%;
        animation-duration: 12s;
      }
      
      .square2 {
        color: rgba(236, 72, 153, 0.4);
        border-color: rgba(236, 72, 153, 0.4);
        top: 70%;
        right: 12%;
        animation-duration: 15s;
        animation-direction: reverse;
      }
      
      .square3 {
        color: rgba(6, 182, 212, 0.4);
        border-color: rgba(6, 182, 212, 0.4);
        bottom: 25%;
        left: 25%;
        animation-duration: 10s;
      }
      
      .square4 {
        color: rgba(16, 185, 129, 0.4);
        border-color: rgba(16, 185, 129, 0.4);
        top: 45%;
        right: 8%;
        animation-duration: 18s;
        animation-direction: reverse;
      }
      
      .square5 {
        color: rgba(245, 158, 11, 0.4);
        border-color: rgba(245, 158, 11, 0.4);
        top: 8%;
        right: 35%;
        animation-duration: 14s;
      }
      
      .pulsing-circle {
        border-radius: 50%;
        animation: pulse 4s ease-in-out infinite;
        filter: drop-shadow(0 0 12px currentColor);
      }
      
      .circle1 {
        width: 25px;
        height: 25px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3));
        color: rgba(139, 92, 246, 0.3);
        top: 25%;
        right: 20%;
        animation-delay: 0s;
        animation-duration: 5s;
      }
      
      .circle2 {
        width: 35px;
        height: 35px;
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(244, 114, 182, 0.3));
        color: rgba(236, 72, 153, 0.3);
        bottom: 35%;
        right: 25%;
        animation-delay: 1s;
        animation-duration: 6s;
      }
      
      .circle3 {
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(8, 145, 178, 0.3));
        color: rgba(6, 182, 212, 0.3);
        top: 60%;
        left: 15%;
        animation-delay: 2s;
        animation-duration: 4.5s;
      }
      
      .circle4 {
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3));
        color: rgba(16, 185, 129, 0.3);
        top: 35%;
        left: 40%;
        animation-delay: 0.5s;
        animation-duration: 5.5s;
      }
      
      .circle5 {
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3));
        color: rgba(245, 158, 11, 0.3);
        bottom: 15%;
        left: 35%;
        animation-delay: 1.5s;
        animation-duration: 4.8s;
      }
      
      .circle6 {
        width: 22px;
        height: 22px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3));
        color: rgba(239, 68, 68, 0.3);
        top: 12%;
        left: 60%;
        animation-delay: 2.5s;
        animation-duration: 5.2s;
      }
      
      .circle7 {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3));
        color: rgba(139, 92, 246, 0.3);
        bottom: 45%;
        right: 40%;
        animation-delay: 3s;
        animation-duration: 6.2s;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 0.8;
        }
        50% { 
          transform: scale(1.3);
          opacity: 1;
        }
      }
      
      .glass-effect {
        background: rgba(30, 30, 50, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        position: relative;
        z-index: 10;
      }
      
      .glass-effect:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.3);
        background: rgba(30, 30, 50, 0.9);
      }
      
      .input-focus:focus {
        outline: none;
        border-color: #10B0D7;
        box-shadow: 0 0 0 3px rgba(16, 176, 215, 0.1);
      }
      
      .fade-in {
        animation: fadeIn 0.8s ease-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .spinner {
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        animation: spin 1s linear infinite;
        display: inline-block;
      }

      .signup-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        position: relative;
        overflow-y: auto;
      }

      .signup-card {
        background: rgba(30, 30, 50, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 40px;
        width: 100%;
        max-width: 600px;
        position: relative;
        z-index: 10;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        animation: fadeIn 0.8s ease-out;
        max-height: 90vh;
        overflow-y: auto;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
          gap: 0;
        }
        
        .signup-card {
          padding: 30px 20px;
          margin: 10px;
        }
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(5, 10, 27, 0.9);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
      }

      .modal-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }

      .modal-content {
        background: rgba(30, 30, 50, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 30px;
        max-width: 700px;
        max-height: 80vh;
        overflow-y: auto;
        margin: 20px;
        transform: scale(0.9) translateY(20px);
        transition: all 0.3s ease;
        width: 100%;
      }

      .modal-overlay.active .modal-content {
        transform: scale(1) translateY(0);
      }

      .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }

      .plan-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }

      .plan-card:hover {
        transform: translateY(-5px);
        border-color: #10B0D7;
        box-shadow: 0 10px 30px rgba(16, 176, 215, 0.2);
      }

      .plan-card.selected {
        border-color: #10B0D7;
        background: rgba(16, 176, 215, 0.1);
      }

      .plan-card.popular::before {
        content: 'RECOMENDADO';
        position: absolute;
        top: -8px;
        right: 15px;
        background: linear-gradient(135deg, #10B0D7, #1BB08C);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
      }

      .whatsapp-widget {
        position: fixed;
        bottom: 25px;
        right: 25px;
        z-index: 1000;
      }

      .whatsapp-button {
        width: 55px;
        height: 55px;
        background: linear-gradient(135deg, #25d366 0%, #20b358 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(37, 211, 102, 0.3);
        transition: all 0.3s ease;
        animation: whatsappPulse 3s infinite;
      }

      .whatsapp-button:hover {
        transform: scale(1.1);
        box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4);
      }

      @keyframes whatsappPulse {
        0%, 100% { 
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.3);
        }
        50% { 
          box-shadow: 0 0 0 8px rgba(37, 211, 102, 0.2), 0 6px 20px rgba(37, 211, 102, 0.3);
        }
      }

      .whatsapp-popup {
        position: absolute;
        bottom: 65px;
        right: 0;
        width: 280px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateY(15px) scale(0.9);
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .whatsapp-popup.active {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .success-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(5, 10, 27, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
      }

      .success-modal.show {
        opacity: 1;
        pointer-events: auto;
      }

      .success-content {
        text-align: center;
        max-width: 450px;
        padding: 40px;
        background: rgba(30, 30, 50, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        animation: successSlideUp 0.5s ease-out;
        margin: 20px;
      }

      @keyframes successSlideUp {
        from { 
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .loading-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(5, 10, 27, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .loading-content {
        text-align: center;
        max-width: 400px;
        padding: 40px;
        background: rgba(30, 30, 50, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        margin: 20px;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const planList = await getPlanList({ listPublic: "false" });
        setPlans(planList);
      } catch (error) {
        toastError(error);
      }
    };
    fetchData();
  }, [getPlanList]);

  // Calcular fuerza de la contraseña
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const updatePasswordStrength = (password) => {
    const strength = calculatePasswordStrength(password);
    const percentage = (strength / 5) * 100;
    
    let text = '';
    let color = '';
    
    if (strength <= 2) {
      color = '#EF4445';
      text = 'Contraseña débil';
    } else if (strength <= 4) {
      color = '#fbd38d';
      text = 'Contraseña media';
    } else {
      color = '#10B0D7';
      text = 'Contraseña fuerte';
    }
    
    setPasswordStrength({ strength, text, color, percentage });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignUp = async (values) => {
    setLoading(true);
    try {
      await openApi.post("/auth/signup", values);
      
      // Show success modal and wait 8 seconds before redirect
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setLoading(false);
        history.push("/login");
      }, 8000);
      
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleClosePlans = () => setOpenPlans(false);

  const toggleWhatsappPopup = () => {
    setWhatsappPopupActive(!whatsappPopupActive);
  };
  
  const startWhatsappChat = () => {
    const phoneNumber = '554198239551';
    const message = '¡Hola! Necesito ayuda con el registro.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Fixed plan selection handler
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    if (formikHelpers) {
      formikHelpers.setFieldValue("planId", planId);
    }
    handleClosePlans();
  };

  // Handle redirect to login
  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    setLoading(false);
    history.push("/login");
  };

  return (
    <div className="signup-container" style={{ background: '#050A1B' }}>
      {/* Animated Lights Background */}
      <div className="lights-bg">
        <div className="light"></div>
        <div className="light"></div>
        <div className="light"></div>
        <div className="light"></div>
        <div className="light"></div>
        <div className="light"></div>
      </div>
      
      {/* Geometric Shapes */}
      <div className="geometric-shapes">
        <div className="shape rotating-square square1"></div>
        <div className="shape rotating-square square2"></div>
        <div className="shape rotating-square square3"></div>
        <div className="shape rotating-square square4"></div>
        <div className="shape rotating-square square5"></div>
        
        <div className="shape pulsing-circle circle1"></div>
        <div className="shape pulsing-circle circle2"></div>
        <div className="shape pulsing-circle circle3"></div>
        <div className="shape pulsing-circle circle4"></div>
        <div className="shape pulsing-circle circle5"></div>
        <div className="shape pulsing-circle circle6"></div>
        <div className="shape pulsing-circle circle7"></div>
      </div>

      {/* Signup Card */}
      <div className="signup-card glass-effect">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#10B0D7] to-[#1BB08C] bg-clip-text text-transparent mb-2">
              Whaticket Pro
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-[#10B0D7] to-[#1BB08C] mx-auto rounded-full"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Crear Cuenta</h2>
          <p className="text-gray-200 text-sm">Complete los datos para comenzar</p>
        </div>

        <Formik
          initialValues={initialState}
          validationSchema={UserSchema}
          onSubmit={handleSignUp}
        >
          {({ touched, errors, isSubmitting, setFieldValue, values }) => {
            // Store formik helpers for use outside of render
            if (!formikHelpers) {
              setFormikHelpers({ setFieldValue });
            }
            
            return (
              <Form className="space-y-6">
                {/* Nome da Empresa */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Nombre de la Empresa
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <Field
                      type="text"
                      name="companyName"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 input-focus transition-all duration-200"
                      placeholder="Su empresa"
                    />
                  </div>
                  {touched.companyName && errors.companyName && (
                    <div className="text-red-400 text-xs mt-1">{errors.companyName}</div>
                  )}
                </div>

                {/* Nome e Telefone */}
                <div className="form-row">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <Field
                        type="text"
                        name="name"
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 input-focus transition-all duration-200"
                        placeholder="Su nombre"
                      />
                    </div>
                    {touched.name && errors.name && (
                      <div className="text-red-400 text-xs mt-1">{errors.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <Field
                        type="tel"
                        name="phone"
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 input-focus transition-all duration-200"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    {touched.phone && errors.phone && (
                      <div className="text-red-400 text-xs mt-1">{errors.phone}</div>
                    )}
                  </div>
                </div>

                {/* Email e Senha */}
                <div className="form-row">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <Field
                        type="email"
                        name="email"
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 input-focus transition-all duration-200"
                        placeholder="su@email.com"
                      />
                    </div>
                    {touched.email && errors.email && (
                      <div className="text-red-400 text-xs mt-1">{errors.email}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <Field
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 input-focus transition-all duration-200"
                        placeholder="••••••••"
                        onChange={(e) => {
                          setFieldValue("password", e.target.value);
                          updatePasswordStrength(e.target.value);
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                        onClick={togglePasswordVisibility}
                      >
                        {passwordVisible ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {values.password && (
                      <>
                        <div className="mt-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300 rounded-full"
                            style={{ 
                              width: `${passwordStrength.percentage}%`,
                              background: passwordStrength.color 
                            }}
                          />
                        </div>
                        <div className="text-xs mt-1" style={{ color: passwordStrength.color }}>
                          {passwordStrength.text}
                        </div>
                      </>
                    )}
                    {touched.password && errors.password && (
                      <div className="text-red-400 text-xs mt-1">{errors.password}</div>
                    )}
                  </div>
                </div>

                {/* Seletor de Plano */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Plan
                  </label>
                  <div 
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer transition-all duration-200 hover:border-[#10B0D7] hover:bg-white/15 flex items-center justify-between relative"
                    onClick={() => setOpenPlans(true)}
                  >
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    </div>
                    <span className={selectedPlan ? "text-white" : "text-gray-400"}>
                      {selectedPlan
                        ? plans.find((p) => p.id === selectedPlan)?.name || "Plano"
                        : "Elegir Plan"}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {touched.planId && errors.planId && (
                    <div className="text-red-400 text-xs mt-1">{errors.planId}</div>
                  )}
                </div>

                {/* Botões */}
                <button 
                  type="submit" 
                  disabled={loading || isSubmitting}
                  className="w-full bg-gradient-to-r from-[#10B0D7] to-[#1BB08C] text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#10B0D7]/30 flex items-center justify-center gap-2 hover:transform hover:translateY(-1px) hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {loading || isSubmitting ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      {i18n.t("signup.buttons.submit") || "Crear Cuenta"}
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  className="w-full bg-transparent border-2 border-white/20 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:border-[#10B0D7] hover:text-[#10B0D7] hover:bg-white/5 flex items-center justify-center gap-2"
                  onClick={() => history.push("/login")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {i18n.t("signup.buttons.login") || "Ya tengo cuenta"}
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>

      {/* Modal de Planos */}
      {openPlans && (
        <div className={`modal-overlay ${openPlans ? 'active' : ''}`} onClick={handleClosePlans}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Elija su Plan</h2>
              <p className="text-gray-300">Seleccione el plan ideal para su empresa</p>
            </div>
            
            <div className="plans-grid">
              {plans.map((plan) => {
                const isPopular =
                  plan.name.toLowerCase().includes("pro") ||
                  plan.name.toLowerCase().includes("recomendado");
                const isFree =
                  plan.amount === 0 ||
                  plan.amount === "0" ||
                  plan.name.toLowerCase().includes("gratuito");
                const isSelected = plan.id === selectedPlan;

                return (
                  <div
                    key={plan.id}
                    className={`plan-card ${isPopular ? 'popular' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">{plan.name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-[#10B0D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{plan.users} Asistentes</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-[#10B0D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{plan.connections} Conexiones</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-[#10B0D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>{plan.queues} Colas</span>
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold text-[#10B0D7]">
                      {isFree ? "Gratis" : `R$ ${plan.amount}`}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                className="px-6 py-2 bg-transparent border border-white/20 text-white rounded-lg hover:border-white/40 transition-colors"
                onClick={handleClosePlans}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Widget */}
      <div className="whatsapp-widget">
        <div className="whatsapp-button" onClick={toggleWhatsappPopup}>
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
          </svg>
        </div>

        <div className={`whatsapp-popup ${whatsappPopupActive ? 'active' : ''}`}>
          <div className="p-4 bg-gradient-to-r from-[#25d366] to-[#20b358] text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Atención en Línea</h3>
              <p className="text-xs opacity-90">Disponible ahora</p>
            </div>
          </div>
          <div className="p-4 bg-[#050A1B]">
            <div className="bg-white/10 p-3 rounded-lg mb-3 text-sm text-white">
              👋 ¡Hola! ¿Necesitas ayuda con el registro?
            </div>
            <button 
              className="w-full bg-gradient-to-r from-[#25d366] to-[#20b358] text-white py-2 px-4 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              onClick={startWhatsappChat}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
              Iniciar conversación
            </button>
          </div>
        </div>
      </div>

      {/* Loading Modal */}
      {loading && !showSuccessModal && (
        <div className="loading-modal">
          <div className="loading-content">
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="w-full h-full border-4 border-gray-600 border-t-[#10B0D7] rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Creando su cuenta...</h3>
            <p className="text-gray-300 text-sm">
              Espere mientras configuramos todo para usted. Esto tomará solo unos segundos.
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <div className={`success-modal ${showSuccessModal ? 'show' : ''}`}>
        <div className="success-content">
          <div className="w-20 h-20 bg-gradient-to-r from-[#10B0D7] to-[#1BB08C] rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#10B0D7] mb-4">¡Cuenta creada con éxito!</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            ¡Felicidades! Su cuenta ha sido creada con éxito. Ya puede iniciar sesión y comenzar a usar nuestra plataforma.
          </p>
          <button 
            className="bg-gradient-to-r from-[#10B0D7] to-[#1BB08C] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:translateY(-1px)"
            onClick={handleGoToLogin}
          >
            Ir a Inicio de Sesión
          </button>
          <p className="text-gray-400 text-sm mt-4">
            Redirigiendo automáticamente en unos segundos...
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;