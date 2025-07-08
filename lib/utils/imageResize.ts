// lib/utils/imageResize.ts

interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

export const resizeImage = (
  file: File,
  options: ResizeOptions = {}
): Promise<{ file: File; dataUrl: string }> => {
  // Skip resizing for SVG files
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ 
          file, 
          dataUrl: e.target?.result as string 
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        // Calculate aspect ratio
        const aspectRatio = width / height;
        
        // Resize logic
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            // Width is the limiting factor
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            // Height is the limiting factor
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Fill white background for JPEG
        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        
        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            // Create new file with the same name
            const fileName = file.name.replace(/\.[^/.]+$/, '') + `.${format}`;
            const resizedFile = new File([blob], fileName, {
              type: `image/${format}`,
              lastModified: Date.now()
            });
            
            // Also get data URL for preview
            const dataUrl = canvas.toDataURL(`image/${format}`, quality);
            
            resolve({ file: resizedFile, dataUrl });
          },
          `image/${format}`,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Check if image needs resizing
export const shouldResizeImage = (
  file: File,
  maxSize: number = 2 * 1024 * 1024, // 2MB default
  maxDimension: number = 800
): Promise<boolean> => {
  // Never resize SVG files
  if (file.type === 'image/svg+xml') {
    return Promise.resolve(false);
  }
  
  return new Promise((resolve) => {
    // Check file size
    if (file.size > maxSize) {
      resolve(true);
      return;
    }
    
    // Check dimensions
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        if (img.width > maxDimension || img.height > maxDimension) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      resolve(false);
    };
    
    reader.readAsDataURL(file);
  });
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};