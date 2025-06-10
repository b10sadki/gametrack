import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { exportUserGames, importUserGames, getUserGameStats } from '../lib/gameStorage';

interface ExportImportProps {
  onImportComplete?: () => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ onImportComplete }) => {
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
      // Vous pourriez ajouter une notification toast ici
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      setImportStatus('error');
      setImportMessage('Veuillez coller des données JSON valides.');
      return;
    }

    const success = importUserGames(importData);
    if (success) {
      setImportStatus('success');
      setImportMessage('Données importées avec succès!');
      setImportData('');
      onImportComplete?.();
      setTimeout(() => {
        setIsImportOpen(false);
        setImportStatus('idle');
      }, 2000);
    } else {
      setImportStatus('error');
      setImportMessage('Erreur lors de l\'importation. Vérifiez le format des données.');
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

  const stats = getUserGameStats();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export */}
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exporter mes données
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Exporter vos données</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Résumé de vos données</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Total de jeux: {stats.total}</div>
                  <div>Jeux terminés: {stats.completed}</div>
                  <div>En cours: {stats.playing}</div>
                  <div>Liste de souhaits: {stats.wishlist}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Données JSON</label>
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
                  Télécharger le fichier
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
              Importer des données
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Importer vos données</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ?? L'importation remplacera toutes vos données actuelles. 
                  Assurez-vous d'avoir fait une sauvegarde au préalable.
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
                <label className="text-sm font-medium">Ou coller les données JSON</label>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Collez ici vos données JSON exportées..."
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
                  Importer les données
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsImportOpen(false);
                    setImportData('');
                    setImportStatus('idle');
                  }}
                >
                  Annuler
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