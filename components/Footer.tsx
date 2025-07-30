import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-16 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-secondary/70">
        <p>&copy; {currentYear} RematoShop. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};