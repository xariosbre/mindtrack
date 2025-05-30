// mindtrack/frontend/src/components/Footer.js

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center mt-auto shadow-inner">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} MindTrack. Todos os direitos reservados.</p>
        <p className="text-sm mt-2">Desenvolvido com ❤️ para aprimorar seus hábitos e humor.</p>
      </div>
    </footer>
  );
};

export default Footer;