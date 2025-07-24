import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
      <p>&copy; {new Date().getFullYear()} Pawsitive Match Adoption Portal. All Rights Reserved.</p>
    </footer>
  );
};
export default Footer;