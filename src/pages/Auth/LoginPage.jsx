import { useState } from "react";
import logo from "../../assets/logo.png";
import { loginUsuario, registerUsuario } from "../../services/usuarios.service";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage({ setIsLoggedIn }) {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: ""
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    nombre: "",
    email: "",
    password: ""
  });

  const { login } = useAuth();

  const handleInputChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "nombre":
        if (!isLoginActive && value.trim().length < 2) {
          return "El nombre debe tener al menos 2 caracteres";
        }
        return "";
      
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Ingresa un email válido (ejemplo: usuario@dominio.com)";
        }
        return "";
      
      case "password":
        if (value.length < 6) {
          return "La contraseña debe tener al menos 6 caracteres";
        }
        if (!isLoginActive && value.length > 0 && !/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
          return "La contraseña debe contener al menos una letra y un número";
        }
        return "";
      
      default:
        return "";
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    let isValid = true;
    const newFieldErrors = {
      nombre: "",
      email: "",
      password: ""
    };

    if (!isLoginActive) {
      const nombreError = validateField("nombre", formData.nombre);
      if (nombreError) {
        newFieldErrors.nombre = nombreError;
        isValid = false;
      }
    }

    const emailError = validateField("email", formData.email);
    if (emailError) {
      newFieldErrors.email = emailError;
      isValid = false;
    }

    const passwordError = validateField("password", formData.password);
    if (passwordError) {
      newFieldErrors.password = passwordError;
      isValid = false;
    }

    setFieldErrors(newFieldErrors);

    if (!isValid) {
      setErrorMessage("Por favor, corrige los errores en el formulario");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      if (isLoginActive) {
        const res = await loginUsuario({
          email: formData.email,
          password: formData.password
        });
        login(res.access_token, res.user);
        setIsLoggedIn(true);
      } else {
        const res = await registerUsuario({
          name: formData.nombre,
          email: formData.email,
          password: formData.password
        });
        login(res.access_token, res.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        "Error al autenticar"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setIsLoginActive(!isLoginActive);
      setFormData({ nombre: "", email: "", password: "" });
      setErrorMessage("");
      setFieldErrors({ nombre: "", email: "", password: "" });
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const leafPositions = [
    "top-[5%] left-[2%] w-[150px] h-[150px] fill-[#c49a6c] opacity-15",
    "bottom-[10%] right-[3%] w-[120px] h-[120px] fill-[#b78c63] opacity-12",
    "top-[30%] left-[10%] w-[100px] h-[100px] fill-[#a57c5a] opacity-10",
    "bottom-[15%] left-[5%] w-[180px] h-[180px] fill-[#dbb58b] opacity-15",
    "top-[15%] right-[5%] w-[130px] h-[130px] fill-[#c49a6c] opacity-12",
    "top-[70%] right-[15%] w-[110px] h-[110px] fill-[#b78c63] opacity-10",
    "bottom-[25%] left-[20%] w-[140px] h-[140px] fill-[#a57c5a] opacity-15",
    "top-[45%] right-[25%] w-[90px] h-[90px] fill-[#dbb58b] opacity-12",
    "top-[80%] left-[12%] w-[160px] h-[160px] fill-[#c49a6c] opacity-10",
    "bottom-[30%] right-[10%] w-[125px] h-[125px] fill-[#b78c63] opacity-15",
    "top-[60%] left-[25%] w-[105px] h-[105px] fill-[#a57c5a] opacity-12",
    "bottom-[5%] right-[20%] w-[145px] h-[145px] fill-[#dbb58b] opacity-10"
  ];

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#fef7e9] to-[#fef0e0] relative overflow-hidden font-sans">
      {/* Hojas animadas */}
      {leafPositions.map((position, i) => (
        <div 
          key={i} 
          className={`absolute pointer-events-none z-10 ${position}`}
          style={{
            animation: `leaf-float ${8 + (i % 5)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            <path d="M50,5 C35,20 20,35 10,50 C5,60 5,75 15,85 C25,95 40,95 50,90 C60,95 75,95 85,85 C95,75 95,60 90,50 C80,35 65,20 50,5 Z" />
          </svg>
        </div>
      ))}

      <div
        className={`w-[900px] h-[560px] rounded-2xl flex overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative z-20 bg-white transition-all duration-500 ${
          isLoginActive ? "" : "flex-row-reverse"
        }`}
      >
        {/* Lado izquierdo con gradiente y bordes redondeados asimétricos */}
        <div className={`w-[45%] bg-gradient-to-br from-[#c49a6c] via-[#b78c63] to-[#a57c5a] text-white flex items-center justify-center p-10 transition-all duration-500 ${
          isLoginActive ? "rounded-r-[120px]" : "rounded-l-[120px]"
        }`}>
          <div className="text-center max-w-[260px]">
            <img 
              src={logo} 
              alt="logo" 
              className="w-[60px] mx-auto mb-5 drop-shadow-md hover:scale-105 hover:rotate-6 transition-transform duration-300 cursor-pointer" 
            />
            <h2 className="text-3xl font-bold mb-4">
              {isLoginActive ? "¡Hola!" : "¡Bienvenido!"}
            </h2>
            <p className="text-sm leading-relaxed opacity-90 mb-6">
              {isLoginActive
                ? "Regístrate con tus datos personales para usar todas las funciones del sistema"
                : "Ingresa tus datos personales para acceder a tu cuenta"}
            </p>
            <button
              onClick={toggleMode}
              disabled={isAnimating}
              className="bg-transparent border-2 border-white text-white px-7 py-2.5 rounded-full font-semibold relative overflow-hidden group transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">
                {isLoginActive ? "Registrarse" : "Iniciar sesión"}
              </span>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 bg-white/30 rounded-full group-hover:w-[300px] group-hover:h-[300px] transition-all duration-700"></span>
            </button>
          </div>
        </div>

        {/* Lado derecho con formularios */}
        <div className="flex-1 flex items-center justify-center p-12 overflow-hidden relative bg-white">
          <div className="w-full max-w-[320px] relative min-h-[380px]">
            {/* Mensaje de error */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm absolute top-[-70px] left-0 w-full">
                {errorMessage}
              </div>
            )}

            {/* Login Form */}
            <div
              className={`w-full transition-all duration-500 ease-in-out ${
                isLoginActive
                  ? "opacity-100 translate-x-0 pointer-events-auto relative"
                  : isAnimating
                  ? "opacity-0 -translate-x-full pointer-events-none absolute top-0 left-0"
                  : "opacity-0 translate-x-full pointer-events-none absolute top-0 left-0"
              }`}
            >
              <h2 className="text-3xl font-bold mb-1 text-[#a57c5a]">Iniciar Sesión</h2>
              <p className="text-sm text-[#b78c63] mb-6 opacity-80">Usa tu correo y contraseña</p>
              
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="flex flex-col mb-4">
                  <label className="text-xs mb-1 text-[#a57c5a] font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading}
                    placeholder="ejemplo@correo.com"
                    autoComplete="email"
                    className={`p-3 rounded-lg border text-sm bg-[#fffbf5] focus:outline-none focus:ring-2 focus:ring-[#c49a6c] focus:border-transparent transition-all duration-300 ${
                      fieldErrors.email ? "border-red-500 bg-red-50" : "border-[#e2d5c8] hover:border-[#c49a6c]"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="flex flex-col mb-6">
                  <label className="text-xs mb-1 text-[#a57c5a] font-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="current-password"
                    className={`p-3 rounded-lg border text-sm bg-[#fffbf5] focus:outline-none focus:ring-2 focus:ring-[#c49a6c] focus:border-transparent transition-all duration-300 ${
                      fieldErrors.password ? "border-red-500 bg-red-50" : "border-[#e2d5c8] hover:border-[#c49a6c]"
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="p-3 bg-gradient-to-r from-[#c49a6c] to-[#b78c63] text-white rounded-lg font-semibold mt-2 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Cargando...
                    </span>
                  ) : "INICIAR SESIÓN"}
                </button>
              </form>
            </div>

            {/* Register Form */}
            <div
              className={`w-full transition-all duration-500 ease-in-out ${
                !isLoginActive
                  ? "opacity-100 translate-x-0 pointer-events-auto relative"
                  : isAnimating
                  ? "opacity-0 translate-x-full pointer-events-none absolute top-0 left-0"
                  : "opacity-0 -translate-x-full pointer-events-none absolute top-0 left-0"
              }`}
            >
              <h2 className="text-3xl font-bold mb-1 text-[#a57c5a]">Crear Cuenta</h2>
              <p className="text-sm text-[#b78c63] mb-6 opacity-80">Regístrate con tu correo</p>
              
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="flex flex-col mb-4">
                  <label className="text-xs mb-1 text-[#a57c5a] font-medium">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading}
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                    className={`p-3 rounded-lg border text-sm bg-[#fffbf5] focus:outline-none focus:ring-2 focus:ring-[#c49a6c] focus:border-transparent transition-all duration-300 ${
                      fieldErrors.nombre ? "border-red-500 bg-red-50" : "border-[#e2d5c8] hover:border-[#c49a6c]"
                    }`}
                  />
                  {fieldErrors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.nombre}</p>
                  )}
                </div>

                <div className="flex flex-col mb-4">
                  <label className="text-xs mb-1 text-[#a57c5a] font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading}
                    placeholder="ejemplo@correo.com"
                    autoComplete="email"
                    className={`p-3 rounded-lg border text-sm bg-[#fffbf5] focus:outline-none focus:ring-2 focus:ring-[#c49a6c] focus:border-transparent transition-all duration-300 ${
                      fieldErrors.email ? "border-red-500 bg-red-50" : "border-[#e2d5c8] hover:border-[#c49a6c]"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="flex flex-col mb-6">
                  <label className="text-xs mb-1 text-[#a57c5a] font-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={loading}
                    placeholder="Mínimo 6 caracteres, una letra y un número"
                    autoComplete="new-password"
                    className={`p-3 rounded-lg border text-sm bg-[#fffbf5] focus:outline-none focus:ring-2 focus:ring-[#c49a6c] focus:border-transparent transition-all duration-300 ${
                      fieldErrors.password ? "border-red-500 bg-red-50" : "border-[#e2d5c8] hover:border-[#c49a6c]"
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="p-3 bg-gradient-to-r from-[#c49a6c] to-[#b78c63] text-white rounded-lg font-semibold mt-2 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Cargando...
                    </span>
                  ) : "REGISTRARSE"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes leaf-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}