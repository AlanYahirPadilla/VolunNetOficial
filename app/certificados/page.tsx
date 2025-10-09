"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Download, Calendar, Clock, CheckCircle, Search, Filter, FileText, Heart, Home, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificateService } from "@/lib/services/CertificateService";
import Link from "next/link";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { MobileNavigation } from "@/components/ui/mobile-navigation";

interface Certificate {
  id: string;
  volunteerId: string;
  eventId: string;
  organizationName: string;
  eventTitle: string;
  eventDate: string;
  hoursCompleted: number;
  certificateCode: string;
  issuedAt: string;
}

export default function CertificadosPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [userName, setUserName] = useState<string>("Voluntario");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchCertificates();
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch("/api/perfil/voluntario", { credentials: "include" });
      const data = await res.json();
      if (data.user) {
        setUserName(`${data.user.firstName} ${data.user.lastName}`);
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error cargando información del usuario:", error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates", { credentials: "include" });
      const data = await res.json();
      if (data.certificates) {
        setCertificates(data.certificates);
      }
    } catch (error) {
      console.error("Error cargando certificados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    const doc = CertificateService.generateCertificate({
      volunteerName: userName,
      organizationName: certificate.organizationName,
      eventTitle: certificate.eventTitle,
      eventDate: new Date(certificate.eventDate),
      hoursCompleted: certificate.hoursCompleted,
      certificateCode: certificate.certificateCode
    });

    CertificateService.downloadCertificate(
      doc,
      `Certificado_${certificate.eventTitle.replace(/\s+/g, '_')}_${certificate.certificateCode}.pdf`
    );
  };

  // Filtrar certificados
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterYear === "all") return matchesSearch;
    
    const certYear = new Date(cert.eventDate).getFullYear().toString();
    return matchesSearch && certYear === filterYear;
  });

  // Obtener años únicos para el filtro
  const years = Array.from(new Set(certificates.map(cert => 
    new Date(cert.eventDate).getFullYear().toString()
  ))).sort((a, b) => parseInt(b) - parseInt(a));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Award className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando certificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-nav-mobile">
      {/* Navigation Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Heart className="h-6 w-6 md:h-8 md:w-8 text-blue-600 fill-blue-200" />
            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VolunNet
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Inicio</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link 
                href="/eventos/buscar" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Calendar className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Eventos</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link 
                href="/comunidad" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Users className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Comunidad</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full rounded-full"></span>
              </Link>
              <Link 
                href="/certificados" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 transition group relative"
              >
                <FileText className="h-5 w-5 text-blue-700" />
                <span>Certificados</span>
                <span className="absolute left-0 -bottom-0.5 w-full h-0.5 bg-blue-600 rounded-full"></span>
              </Link>
              <Link 
                href="/notificaciones" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Notificaciones</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation user={user} currentPath="/certificados" />
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl shadow-md">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mis Certificados
              </h1>
              <p className="text-gray-500 text-sm">
                {certificates.length} certificado{certificates.length !== 1 ? 's' : ''} obtenido{certificates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y búsqueda */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
            <input
              type="text"
              placeholder="Buscar por evento u organización..."
              className="w-full pl-10 pr-4 py-2.5 border border-blue-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por año */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 border border-purple-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 appearance-none transition-all"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="all">Todos los años</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de certificados */}
        {filteredCertificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100"
          >
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {searchTerm || filterYear !== "all" ? "No se encontraron certificados" : "Aún no tienes certificados"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterYear !== "all" 
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Completa eventos para obtener certificados de participación"}
            </p>
            {!searchTerm && filterYear === "all" && (
              <Link href="/eventos">
                <Button className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-md rounded-xl">
                  Explorar Eventos
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCertificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-blue-100 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all duration-300"
              >
                {/* Header del certificado */}
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/30 rounded-xl backdrop-blur-sm">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white/90 text-xs font-medium">Certificado de Participación</p>
                        <p className="text-white font-bold text-sm">{certificate.certificateCode}</p>
                      </div>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-200" />
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 line-clamp-2">
                    {certificate.eventTitle}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Award className="h-3.5 w-3.5 text-purple-500" />
                      </div>
                      <span className="text-sm">{certificate.organizationName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <span className="text-sm">
                        {new Date(certificate.eventDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-green-500" />
                      </div>
                      <span className="text-sm">{certificate.hoursCompleted} horas completadas</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                    <p className="text-xs text-gray-400">
                      Emitido el {new Date(certificate.issuedAt).toLocaleDateString('es-ES')}
                    </p>
                    <Button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:from-blue-500 hover:to-purple-500 shadow-md gap-2 rounded-xl"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      Descargar PDF
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-blue-100 p-6"
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              Estadísticas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  {certificates.length}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">Certificados</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  {certificates.reduce((sum, cert) => sum + cert.hoursCompleted, 0)}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">Horas totales</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                  {new Set(certificates.map(c => c.organizationName)).size}
                </p>
                <p className="text-xs text-purple-600 font-medium mt-1">Organizaciones</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                  {years.length}
                </p>
                <p className="text-xs text-pink-600 font-medium mt-1">Años activo</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

