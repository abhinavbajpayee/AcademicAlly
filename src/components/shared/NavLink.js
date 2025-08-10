import React from 'react';

const NavLink = ({ to, children, currentPath, onNavigate }) => {
  const isActive = currentPath === to;
  const activeClass = isActive ? 'bg-indigo-700' : 'hover:bg-indigo-600';

  return (
    <li className={`rounded-lg transition-colors duration-200 ${activeClass}`}>
      <button
        onClick={() => onNavigate(to)}
        className="w-full flex items-center gap-3 p-3 text-sm font-medium text-white"
      >
        {children}
      </button>
    </li>
  );
};

export default NavLink;
