import React, { useCallback } from 'react';
import { Upload, X, File, FileText, Image as ImageIcon } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { formatFileSize } from '../../utils/formatters';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  accept?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  maxFiles = 10,
  accept = '.pdf,.jpg,.jpeg,.png',
  className = ''
}) => {
  const { files, uploading, progress, addFiles, removeFile, clearFiles, uploadFiles } = useFileUpload(maxFiles);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const handleUpload = async () => {
    await uploadFiles(async (file) => {
      // Cette fonction sera appelée pour chaque fichier
      // Elle doit retourner une promesse
      return onUpload([file]);
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50"
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Glissez-déposez vos fichiers ici, ou
        </p>
        <label className="inline-block">
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium">
            Parcourir
          </span>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Formats acceptés: {accept} • Maximum {maxFiles} fichiers • Max 10 MB par fichier
        </p>
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Fichiers sélectionnés ({files.length})
            </h4>
            <button
              type="button"
              onClick={clearFiles}
              disabled={uploading}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Tout effacer
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Barre de progression */}
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Upload en cours...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Bouton d'upload */}
          {!uploading && (
            <button
              type="button"
              onClick={handleUpload}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Télécharger {files.length} fichier{files.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
};