import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { validateFile } from '../utils/validators';
import { FILE_UPLOAD } from '../utils/constants';

export const useFileUpload = (maxFiles: number = 10) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    });

    setFiles(prev => {
      const combined = [...prev, ...validFiles];
      if (combined.length > maxFiles) {
        toast.warning(`Maximum ${maxFiles} fichiers autorisés`);
        return combined.slice(0, maxFiles);
      }
      return combined;
    });
  }, [maxFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setProgress(0);
  }, []);

  const uploadFiles = useCallback(async (uploadFn: (file: File) => Promise<any>) => {
    setUploading(true);
    setProgress(0);

    try {
      const total = files.length;
      const results = [];

      for (let i = 0; i < total; i++) {
        const result = await uploadFn(files[i]);
        results.push(result);
        setProgress(((i + 1) / total) * 100);
      }

      toast.success(`${total} fichier(s) uploadé(s)`);
      clearFiles();
      return results;
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
      throw error;
    } finally {
      setUploading(false);
    }
  }, [files, clearFiles]);

  return {
    files,
    uploading,
    progress,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles
  };
};