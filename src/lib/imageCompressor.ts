export async function compressImage(file: File, maxWidth: number = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return reject(new Error("Empty file result"));

      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to original if canvas not supported
          return resolve(src);
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Try to export as webp, fallback to jpeg if unsupported
        let dataUrl = canvas.toDataURL("image/webp", 0.8);
        if (dataUrl === "data:," || !dataUrl.startsWith("data:image/webp")) {
          // Fallback
          dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        }
        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
