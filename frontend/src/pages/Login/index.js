import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/Auth/AuthContext';

const LoginScreen = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastState, setToastState] = useState({ show: false, message: '', type: '' });

  // Usar o contexto de autenticação
  const { handleLogin } = useContext(AuthContext);

  // Aplicar estilos CSS idênticos ao HTML
  useEffect(() => {
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
      
      /* Quadrados com bordas finas girando */
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
      
      /* Círculos preenchidos pulsando */
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
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
      }
      
      .btn-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
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
      
      .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .toggle-switch.active {
        background: linear-gradient(135deg, #10B0D7, #1BB08C);
      }
      
      .toggle-slider {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .toggle-switch.active .toggle-slider {
        transform: translateX(20px);
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

      /* Toast notifications */
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        transform: translateX(400px);
        transition: all 0.3s ease;
        border-left: 4px solid;
      }

      .toast.show {
        transform: translateX(0);
      }

      .toast.success {
        background: rgba(34, 197, 94, 0.9);
        border-left-color: #22c55e;
      }

      .toast.error {
        background: rgba(239, 68, 68, 0.9);
        border-left-color: #ef4444;
      }

      .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .toast-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await handleLogin({ email, password });
      showToast('¡Inicio de sesión exitoso!', 'success');
      history.push("/");
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToastState({ show: true, message, type });
    setTimeout(() => {
      setToastState({ show: false, message: '', type: '' });
    }, 4000);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleToggleRemember = () => {
    setRememberMe(!rememberMe);
  };

  const handleForgotPassword = () => {
    const phoneNumber = '554198239551';
    const message = '¡Hola! Necesito ayuda para recuperar mi contraseña.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSignUp = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#050A1B' }}>
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
        {/* Quadrados girando */}
        <div className="shape rotating-square square1"></div>
        <div className="shape rotating-square square2"></div>
        <div className="shape rotating-square square3"></div>
        <div className="shape rotating-square square4"></div>
        <div className="shape rotating-square square5"></div>

        {/* Círculos pulsando */}
        <div className="shape pulsing-circle circle1"></div>
        <div className="shape pulsing-circle circle2"></div>
        <div className="shape pulsing-circle circle3"></div>
        <div className="shape pulsing-circle circle4"></div>
        <div className="shape pulsing-circle circle5"></div>
        <div className="shape pulsing-circle circle6"></div>
        <div className="shape pulsing-circle circle7"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="glass-effect rounded-2xl p-8 shadow-2xl fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#10B0D7] to-[#1BB08C] bg-clip-text text-transparent mb-2">
                Whaticket Pro
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-[#10B0D7] to-[#1BB08C] mx-auto rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Bienvenido</h2>
            <p className="text-gray-200 text-sm">Inicia sesión en tu cuenta para continuar</p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 input-focus transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Contraseña
              </label>

              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 input-focus transition-all duration-200"
                  placeholder="••••••••"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-200 cursor-pointer">
                <div
                  className={`toggle-switch ${rememberMe ? 'active' : ''}`}
                  onClick={handleToggleRemember}
                >
                  <div className="toggle-slider"></div>
                </div>
                <span className="ml-3">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-[#10B0D7] hover:text-[#1BB08C] transition-colors"
                onClick={handleForgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-[#10B0D7] to-[#1BB08C] text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#10B0D7]/30 flex items-center justify-center gap-2 hover:transform hover:translateY(-1px) hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar sesión
                </>
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-gray-300 text-sm">
              ¿No tienes una cuenta?
              <button
                type="button"
                className="text-[#10B0D7] hover:text-[#1BB08C] font-medium transition-colors ml-1"
                onClick={handleSignUp}
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastState.show && (
        <div className={`toast show ${toastState.type}`}>
          <div className="toast-content">
            {toastState.type === 'success' ? (
              <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toastState.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;