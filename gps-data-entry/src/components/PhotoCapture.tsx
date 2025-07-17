"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Image, X, Download, RotateCcw, Smartphone } from "lucide-react";

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  filename: string;
  size: number;
}

interface PhotoCaptureProps {
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export function PhotoCapture({ onPhotosChange, maxPhotos = 5, disabled }: PhotoCaptureProps) {
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);

      // Request camera access with preference for back camera on mobile
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setIsCapturing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create photo object
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = Date.now();
        const filename = `site-photo-${timestamp}.jpg`;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const dataUrl = e.target?.result as string;

          const newPhoto: CapturedPhoto = {
            id: `photo-${timestamp}`,
            dataUrl,
            timestamp,
            filename,
            size: blob.size
          };

          setCapturedPhotos(prev => {
            const updated = [...prev, newPhoto];

            // Convert to File objects for parent component
            const files = updated.map(photo => {
              // Convert data URL back to File
              const byteString = atob(photo.dataUrl.split(',')[1]);
              const mimeString = photo.dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              return new File([ab], photo.filename, { type: mimeString });
            });

            onPhotosChange(files);
            return updated;
          });
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.8);

    // Stop camera after capture
    stopCamera();
  }, [onPhotosChange]);

  const removePhoto = (id: string) => {
    setCapturedPhotos(prev => {
      const updated = prev.filter(photo => photo.id !== id);

      // Update parent component
      const files = updated.map(photo => {
        const byteString = atob(photo.dataUrl.split(',')[1]);
        const mimeString = photo.dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new File([ab], photo.filename, { type: mimeString });
      });

      onPhotosChange(files);
      return updated;
    });
  };

  const downloadPhoto = (photo: CapturedPhoto) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const dataUrl = e.target?.result as string;
          const timestamp = Date.now();

          const newPhoto: CapturedPhoto = {
            id: `upload-${timestamp}-${Math.random()}`,
            dataUrl,
            timestamp,
            filename: file.name,
            size: file.size
          };

          setCapturedPhotos(prev => {
            const updated = [...prev, newPhoto];

            // Update parent with all files
            const allFiles = updated.map((photo, index) => {
              if (photo.id === newPhoto.id) {
                return file; // Use original file for uploaded images
              }
              // Convert existing photos back to files
              const byteString = atob(photo.dataUrl.split(',')[1]);
              const mimeString = photo.dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              return new File([ab], photo.filename, { type: mimeString });
            });

            onPhotosChange(allFiles);
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    });

    // Clear the input
    event.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-teal-600" />
          <span className="font-medium text-gray-900">Site Documentation Photos</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {capturedPhotos.length}/{maxPhotos} photos
        </Badge>
      </div>

      {/* Camera Interface */}
      {isCapturing && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <Button
              onClick={capturePhoto}
              className="bg-white text-gray-900 hover:bg-gray-100 rounded-full w-16 h-16"
            >
              <Camera className="w-6 h-6" />
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Camera Error */}
      {cameraError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{cameraError}</p>
        </div>
      )}

      {/* Control Buttons */}
      {!isCapturing && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={startCamera}
            disabled={disabled || capturedPhotos.length >= maxPhotos}
            className="flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Take Photo</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || capturedPhotos.length >= maxPhotos}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Image className="w-4 h-4" />
            <span>Upload Photo</span>
          </Button>
        </div>
      )}

      {/* Mobile Tip */}
      {capturedPhotos.length === 0 && (
        <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Mobile Photography Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Hold device steady for clear images</li>
              <li>• Ensure good lighting for site details</li>
              <li>• Capture multiple angles of work areas</li>
              <li>• Include reference objects for scale</li>
            </ul>
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      {capturedPhotos.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Captured Photos</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {capturedPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.dataUrl}
                  alt={photo.filename}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />

                {/* Photo Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => downloadPhoto(photo)}
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => removePhoto(photo.id)}
                      size="sm"
                      variant="destructive"
                      className="w-8 h-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Photo Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg">
                  <div className="truncate">{photo.filename}</div>
                  <div className="text-gray-300">{formatFileSize(photo.size)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
