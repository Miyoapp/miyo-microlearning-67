
const CourseFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="miyo-container">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Miyo. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-2">
            <a 
              href="https://vivid-starburst-622.notion.site/Miyo-T-rminos-y-Condiciones-238d6ffdc13f8054b172d3a711c905b5?pvs=143" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-miyo-800 text-sm transition-colors"
            >
              Términos
            </a>
            <a 
              href="https://vivid-starburst-622.notion.site/Miyo-Pol-tica-de-Privacidad-238d6ffdc13f80d2899adeaf820c4ce0?source=copy_link" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-miyo-800 text-sm transition-colors"
            >
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CourseFooter;
