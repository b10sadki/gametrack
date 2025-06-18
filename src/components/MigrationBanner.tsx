import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface MigrationBannerProps {
  onMigrate: () => Promise<boolean>;
  onDismiss: () => void;
}

export default function MigrationBanner({ onMigrate, onDismiss }: MigrationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleMigrate = async () => {
    setIsLoading(true);
    setStatus('idle');
    
    try {
      const success = await onMigrate();
      setStatus(success ? 'success' : 'error');
      
      if (success) {
        setTimeout(() => {
          onDismiss();
        }, 2000);
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div className="flex-1">
            <h3 className="text-green-400 font-medium">Migration Successful!</h3>
            <p className="text-green-300/80 text-sm mt-1">
              Your game library has been successfully migrated to the cloud. You can now access it from any device.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Upload className="w-5 h-5 text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-yellow-400 font-medium">Migrate Your Game Library</h3>
          <p className="text-gray-300 text-sm mt-1 mb-3">
            We found games saved locally on this device. Would you like to migrate them to your cloud account? 
            This will allow you to access your library from any device.
          </p>
          
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
              <AlertCircle className="w-4 h-4" />
              <span>Migration failed. Please try again or contact support.</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleMigrate}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Migrate Now
                </>
              )}
            </button>
            <button
              onClick={onDismiss}
              disabled={isLoading}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}