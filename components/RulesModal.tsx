import React from 'react';
import InfoIcon from './icons/InfoIcon';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h3 className="text-xl font-bold text-[#1A3A3A] mb-4">Usage & Rules Information</h3>
        
        <div className="text-sm text-gray-700 space-y-4">
          {/* How to Use Section */}
          <div>
            <h4 className="font-bold text-md text-[#1A3A3A] mb-2">How to Use the Live Compass</h4>
            <p>
              The compass arrow shows the wind direction relative to the direction your phone is pointing.
            </p>
            <p className="mt-1">
              <strong>Example:</strong> If the wind is from the North (a headwind on a North-facing hole) and you point your phone East, the arrow will point left.
            </p>
          </div>

          <div className="p-3 bg-gray-100 rounded-lg flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-800">
              The wind dial data is live and updates automatically every 30 minutes.
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-bold text-md text-[#1A3A3A] mb-2">Permitted within the Rules of Golf</h4>
            <div className="space-y-3">
              <p>
                This app is designed to be fully compliant with the Rules of Golf, specifically <strong>Rule 4.3a(1)</strong>.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Weather Information:</strong> The rule permits players to access weather reports from any source. All data in this app is publicly available weather forecast information.
                </li>
                <li>
                  <strong>Compass Feature:</strong> The rule does <em>not</em> allow the use of features that measure elevation changes or provide club recommendations. This app <strong>does not</strong> include any such prohibited features. The compass only shows orientation, which is not a restricted function.
                </li>
              </ul>
               <p className="font-semibold pt-2">
                Therefore, using this app during a round is permitted.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-[#1A3A3A] hover:bg-[#112020] text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
