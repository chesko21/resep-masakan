import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-tl from-accent-600 via-wavy-purple to-secondary-600 text-sm text-white text-center">
      <div className="py-2">
        Hak Cipta © {currentYear} Resep Masakan Indonesia. Semua Hak Dilindungi.
      </div>
    </footer>
  );
};

export default Footer;
