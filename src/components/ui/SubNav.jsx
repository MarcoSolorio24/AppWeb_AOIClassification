import React from 'react';
import { NavLink } from 'react-router-dom';

const SubNav = ({ links }) => {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <ul className="flex overflow-x-auto justify-end">
        {links.map((link, idx) => (
          <li key={idx} className="shrink-0">
            <NavLink
              to={link.to}
              end
              className={({ isActive }) =>
                `px-8 py-4 text-sm font-medium border-r border-gray-200 transition-colors rounded-none block ${isActive
                  ? 'text-white bg-[#003588]'
                  : 'text-gray-600 hover:bg-[#003588] hover:text-white bg-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SubNav;
