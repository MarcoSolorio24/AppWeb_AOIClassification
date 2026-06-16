import React from 'react';

const SlideOver = ({ isOpen, onClose, title, children }) => {
  return (
    <div className={`fixed inset-0 z-50 flex justify-end ${isOpen ? '' : 'pointer-events-none'}`}>

      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={isOpen ? onClose : undefined}
      />


      <div className={`relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>


        <div className="bg-[#003588] px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>


        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
};

export default SlideOver;
