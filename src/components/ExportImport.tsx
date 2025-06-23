import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { exportUserGames, importUserGames } from '../lib/gameStorage';
import { useGameStorage } from '../hooks/usePocketBaseGameStorage';

interface ExportImportProps {
  onImportComplete?: () => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ onImportComplete }) => {
  const { getStats } = useGameStorage();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleExport = () => {
    const data = exportUserGames();
    setExportData(data);
    setIsExportOpen(true);
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gametrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      // You could add a toast notification here
    } catch (err) {
      console.error('Error during copy:', err);
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      setImportStatus('error');
      setImportMessage('Veuillez coller des donnees JSON valides.');
      return;
    }

    const success = importUserGames(importData);
    if (success) {
      setImportStatus('success');
      setImportMessage('Donnees importees avec succes!');
      setImportData('');
      onImportComplete?.();
      setTimeout(() => {
        setIsImportOpen(false);
        setImportStatus('idle');
      }, 2000);
    } else {
      setImportStatus('error');
      setImportMessage('Import error. Please check the data format.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export */}
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exporter mes donnees
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Exporter vos donnees</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resume de vos donnees</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Total de jeux: {stats.total}</div>
                  <div>Completed games: {stats.completed}</div>
        <div>Playing: {stats.playing}</div>
        <div>Wishlist: {stats.wishlist}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Donnees JSON</label>
                <Textarea
                  value={exportData}
                  readOnly
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Download file
                </Button>
                <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1">
                  Copier dans le presse-papiers
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Importer des donnees
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Importer vos donnees</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ?? L'importation remplacera toutes vos donnees actuelles. 
                  Assurez-vous d'avoir fait une sauvegarde au prealable.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Importer depuis un fichier</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ou coller les donnees JSON</label>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Collez ici vos donnees JSON exportees..."
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>

              {importStatus !== 'idle' && (
                <Alert className={importStatus === 'success' ? 'border-green-500' : 'border-red-500'}>
                  {importStatus === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription className={importStatus === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {importMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleImport} 
                  disabled={!importData.trim() || importStatus === 'success'}
                  className="flex-1"
                >
                  Importer les donnees
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsImportOpen(false);
                    setImportData('');
                    setImportStatus('idle');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ExportImport;