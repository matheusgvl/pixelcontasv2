import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  onFileSelect,
  accept = '.pdf,.xml,.png,.jpg,.jpeg,.pfx',
  maxSizeMB = 5,
  label = 'Arraste e solte o arquivo aqui ou clique para buscar'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    setError(null);
    
    // Validate size
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      setError(`O arquivo excede o limite de tamanho de ${maxSizeMB}MB.`);
      return false;
    }

    // Validate type (basic extension check)
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const acceptedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    
    if (accept !== '*' && !acceptedExtensions.includes(extension)) {
      setError(`Formato de arquivo inválido. Formatos aceitos: ${accept}`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className={`w-full p-8 border-2 border-dashed rounded-premium flex flex-col items-center justify-center gap-4 transition-all duration-200 text-center
          ${dragActive ? 'border-pixel-navy-900 bg-pixel-navy-900-soft/10 scale-[0.99]' : 'border-pixel-neutral-200 bg-white'}
          ${selectedFile ? 'border-green-600 bg-green-600-bg/10' : ''}
          ${error ? 'border-red-600 bg-red-600-bg/10' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="p-3 bg-functional-success/10 text-green-600 rounded-full">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-pixel-neutral-900 max-w-xs truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-pixel-neutral-500">
                {(selectedFile.size / 1024).toFixed(1)} KB | Upload concluído
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={clearFile}
              className="mt-1"
            >
              Remover arquivo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-full ${dragActive ? 'bg-brand-teal/10 text-pixel-navy-900' : 'bg-pixel-neutral-100 text-pixel-neutral-500'}`}>
              <Upload className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-pixel-neutral-900">
                {label}
              </p>
              <p className="text-xs text-pixel-neutral-500">
                Formatos aceitos: {accept} (Máx. {maxSizeMB}MB)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onButtonClick}
              type="button"
            >
              Selecionar arquivo
            </Button>
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </div>
  );
};
