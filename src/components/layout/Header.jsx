import React from 'react';

const Header = ({ title }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 shrink-0 flex items-center">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    </header>
  );
};

export default Header;
