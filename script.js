document.addEventListener('DOMContentLoaded', () => {
     const qrForm = document.getElementById('qrForm');
     const urlInput = document.getElementById('urlInput');
     const qrContainer = document.getElementById('qrContainer');
     const errorMessage = document.getElementById('errorMessage');
     const actionsContainer = document.getElementById('actionsContainer');
     const finalUrlDisplay = document.getElementById('finalUrlDisplay');
     const copyButton = document.getElementById('copyButton');
     const downloadPNGButton = document.getElementById('downloadPNGButton');

     let generatedUrl = '';
     let currentCanvas = null;

     function mostrarError(mensaje) {
          errorMessage.textContent = mensaje;
          errorMessage.style.display = 'block';
          qrContainer.style.display = 'none';
          actionsContainer.style.display = 'none';
          // Forzar reflow para reiniciar animación
          errorMessage.style.animation = 'none';
          setTimeout(() => {
               errorMessage.style.animation = '';
          }, 10);
     }

     function ocultarError() {
          errorMessage.style.display = 'none';
     }

     function generarQRAltaCalidad(finalUrl) {
          try {
               const typeNumber = 0;
               const errorCorrectionLevel = 'H';
               const qr = qrcode(typeNumber, errorCorrectionLevel);
               qr.addData(finalUrl);
               qr.make();

               const moduleCount = qr.getModuleCount();
               const escala = 8;
               const baseSize = 50;
               const scaledSize = baseSize * escala;
               const cellSize = scaledSize / moduleCount;

               const canvas = document.createElement('canvas');
               canvas.width = scaledSize;
               canvas.height = scaledSize;

               const ctx = canvas.getContext('2d');
               ctx.imageSmoothingEnabled = false;

               ctx.fillStyle = '#ffffff';
               ctx.fillRect(0, 0, scaledSize, scaledSize);

               ctx.fillStyle = '#000000';

               for (let row = 0; row < moduleCount; row++) {
                    for (let col = 0; col < moduleCount; col++) {
                         if (qr.isDark(row, col)) {
                              ctx.fillRect(
                                   Math.floor(col * cellSize),
                                   Math.floor(row * cellSize),
                                   Math.ceil(cellSize),
                                   Math.ceil(cellSize)
                              );
                         }
                    }
               }

               return canvas;
          } catch (error) {
               throw new Error('Error al generar QR: ' + error.message);
          }
     }

     function mostrarQR(finalUrl) {
          qrContainer.innerHTML = '';
          ocultarError();

          try {
               const canvas = generarQRAltaCalidad(finalUrl);
               currentCanvas = canvas;

               const displayCanvas = document.createElement('canvas');
               displayCanvas.width = 220;
               displayCanvas.height = 220;

               const displayCtx = displayCanvas.getContext('2d');
               displayCtx.imageSmoothingEnabled = false;
               displayCtx.drawImage(canvas, 0, 0, 220, 220);

               qrContainer.appendChild(displayCanvas);
               qrContainer.style.display = 'block';
               actionsContainer.style.display = 'block';
               finalUrlDisplay.textContent = finalUrl;

               // Reiniciar animación
               qrContainer.style.animation = 'none';
               actionsContainer.style.animation = 'none';
               setTimeout(() => {
                    qrContainer.style.animation = '';
                    actionsContainer.style.animation = '';
               }, 10);
          } catch (error) {
               mostrarError(error.message);
          }
     }

     function procesarURL(rawUrl) {
          if (!rawUrl || rawUrl.trim() === '') {
               mostrarError('Ingresá una URL antes de continuar.');
               return null;
          }
          if (rawUrl.includes(' ')) {
               mostrarError('La URL no puede tener espacios.');
               return null;
          }
          if (rawUrl.indexOf('.') === -1 && !rawUrl.startsWith('localhost')) {
               mostrarError('La URL no es válida. Ejemplo: "https://www.google.com"');
               return null;
          }

          let finalUrl = rawUrl.trim();

          if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
               finalUrl = 'https://' + finalUrl;
          }

          return finalUrl;
     }

     qrForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const rawUrl = urlInput.value;
          const finalUrl = procesarURL(rawUrl);

          if (finalUrl) {
               generatedUrl = finalUrl;
               mostrarQR(finalUrl);
          }
     });

     copyButton.addEventListener('click', () => {
          if (!generatedUrl) return;

          navigator.clipboard.writeText(generatedUrl)
               .then(() => {
                    const originalText = copyButton.textContent;
                    copyButton.classList.add('copied');
                    copyButton.textContent = '¡Copiado!';
                    setTimeout(() => {
                         copyButton.textContent = originalText;
                         copyButton.classList.remove('copied');
                    }, 2000);
               })
               .catch(err => {
                    console.error('Error al copiar: ', err);
                    const textArea = document.createElement('textarea');
                    textArea.value = generatedUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                         document.execCommand('copy');
                         copyButton.textContent = '¡Copiado!';
                         setTimeout(() => {
                              copyButton.textContent = 'Copiar URL';
                         }, 2000);
                    } catch (fallbackErr) {
                         alert('No se pudo copiar la URL. Cópiala manualmente: ' + generatedUrl);
                    }
                    document.body.removeChild(textArea);
               });
     });

     downloadPNGButton.addEventListener('click', () => {
          if (!currentCanvas) return;

          const link = document.createElement('a');
          link.href = currentCanvas.toDataURL('image/png', 1.0);
          link.download = 'codigo-qr.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
     });
});