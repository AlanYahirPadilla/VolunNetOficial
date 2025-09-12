// components/registro/avatar-selection-modal.tsx

import React, { useState } from 'react';

// Define las props que recibirá el componente
interface AvatarSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
  avatars: string[]; // Un array con las rutas a las imágenes
  currentAvatar: string | null;
}

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ open, onClose, onSave, avatars, currentAvatar }) => {
  // Estado interno para manejar el avatar seleccionado en el modal
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);

  if (!open) {
    return null;
  }

  const handleSaveClick = () => {
    if (selectedAvatar) {
      onSave(selectedAvatar);
    }
  };

  return (
    // Contenedor principal del modal (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Contenido del modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Elige tu Avatar</h2>
        
        {/* Grid para mostrar los avatares */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 max-h-64 overflow-y-auto pr-2">
          {avatars.map((avatarUrl) => (
            <button
              key={avatarUrl}
              onClick={() => setSelectedAvatar(avatarUrl)}
              className={`rounded-full overflow-hidden focus:outline-none transition-all duration-200 ${selectedAvatar === avatarUrl ? 'ring-4 ring-blue-500 p-1' : 'hover:scale-105'}`}
            >
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            </button>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            disabled={!selectedAvatar} // Se deshabilita si no hay selección
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;