
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.8;

export interface ProcessedImage {
  base64: string; // For the API
  dataUrl: string; // For preview
}

/**
 * Takes a File object, compresses it, and converts it to both a Base64 string
 * and a Data URL.
 * @param file The image file to process.
 * @returns A promise that resolves with an object containing the base64 and dataUrl.
 */
export const processImageForAnalysis = (file: File): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    // Use FileReader to get a data URL representation of the file
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (readerEvent) => {
      if (!readerEvent.target?.result) {
        return reject(new Error("Could not read file."));
      }

      const img = new Image();
      img.src = readerEvent.target.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resizing logic to maintain aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context for image processing.'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Directly get the compressed data URL from the canvas
        const dataUrl = canvas.toDataURL(MIME_TYPE, QUALITY);
        const base64 = dataUrl.split(',')[1];

        if (!base64) {
            return reject(new Error('Failed to extract Base64 from the processed image.'));
        }

        resolve({ base64, dataUrl });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for processing. The file might be corrupt or in an unsupported format.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the provided file.'));
    };
  });
};
