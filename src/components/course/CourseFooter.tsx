
const CourseFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="miyo-container">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Miyo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CourseFooter;
