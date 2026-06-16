import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, isPending = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">

      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isPending ? undefined : onClose}
      />

      <div className="relative bg-white p-6 border-t-4 border-[#003588] shadow-2xl rounded-none w-96 max-w-full">
        <p className="text-gray-800 text-lg mb-6 text-center">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-none hover:bg-gray-50 focus:outline-none disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 bg-white text-[#003588] border border-[#003588] hover:bg-[#003588] hover:text-white transition-colors duration-200 rounded-none flex items-center shadow-sm text-sm font-medium focus:outline-none ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPending ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
