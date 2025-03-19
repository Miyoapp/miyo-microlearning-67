
import Header from "@/components/Header";

const Business = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="miyo-container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-miyo-800 mb-6">MIYO for Business</h1>
            <p className="text-xl text-gray-600 mb-12">
              Potencia el desarrollo profesional de tu equipo con contenido educativo de alta calidad
            </p>
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-10">
              <p className="text-gray-600">
                Esta sección ha sido simplificada y está lista para recibir el nuevo diseño.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-12">
        <div className="miyo-container">
          <div className="text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} MIYO for Business. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Business;
