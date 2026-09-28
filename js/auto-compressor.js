/**
 * Digital Hunarmand Hub — Intelligent Client-Side Auto Compressor Engine
 * Automatically intercepts and compresses image uploads/components on-the-fly
 * Retains high visual fidelity while reducing file size by up to 70%–90%.
 * Supports WebP/JPEG, alpha preservation, canvas scaling, and DataTransfer replacement.
 */
(function(window, document) {
  'use strict';

  var DEFAULT_OPTIONS = {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
    thresholdBytes: 350 * 1024, // Auto compress if > 350 KB
    preferredFormat: 'image/webp',
    fallbackFormat: 'image/jpeg',
    showToast: true
  };

  // Test WebP canvas export capability once
  var isWebPSupported = (function() {
    try {
      var c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch(e) {
      return false;
    }
  })();

  function formatBytes(bytes, decimals) {
    if (!bytes || bytes <= 0) return '0 B';
    var k = 1024;
    var dm = decimals < 0 ? 0 : (decimals || 1);
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Toast notification system
  var toastContainer = null;
  function showToast(message, icon) {
    try {
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'dh-compressor-toasts';
        toastContainer.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;font-family:system-ui,-apple-system,sans-serif;max-width:calc(100vw - 48px);';
        document.body.appendChild(toastContainer);
      }

      var toast = document.createElement('div');
      toast.style.cssText = 'background:rgba(15,23,42,0.92);border:1px solid rgba(59,130,246,0.4);border-radius:12px;padding:10px 16px;color:#f8fafc;font-size:13px;display:flex;align-items:center;gap:10px;box-shadow:0 10px 30px rgba(0,0,0,0.5),0 0 15px rgba(59,130,246,0.25);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);pointer-events:auto;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);opacity:0;transform:translateY(15px);';
      
      var iconSpan = document.createElement('span');
      iconSpan.textContent = icon || '⚡';
      iconSpan.style.cssText = 'font-size:16px;line-height:1;display:inline-block;';

      var textSpan = document.createElement('span');
      textSpan.innerHTML = message;
      textSpan.style.cssText = 'line-height:1.4;';

      toast.appendChild(iconSpan);
      toast.appendChild(textSpan);
      toastContainer.appendChild(toast);

      // Trigger enter animation
      requestAnimationFrame(function() {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      // Auto dismiss after 3.8s
      setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-8px)';
        setTimeout(function() {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 320);
      }, 3800);
    } catch(e) {
      console.warn('[DH Compressor Toast]', e);
    }
  }

  // Check if image blob/canvas has transparency (alpha channel)
  function hasAlphaChannel(ctx, width, height) {
    try {
      var imgData = ctx.getImageData(0, 0, width, height).data;
      for (var i = 3; i < imgData.length; i += 4) {
        if (imgData[i] < 254) return true;
      }
      return false;
    } catch(e) {
      return false;
    }
  }

  /**
   * Compress a single File or Blob object
   * @param {File|Blob} file 
   * @param {Object} customOpts
   * @returns {Promise<File>}
   */
  function compressFile(file, customOpts) {
    return new Promise(function(resolve, reject) {
      if (!file || !(file instanceof Blob)) {
        return reject(new Error('Invalid file object provided'));
      }

      // If not an image, return untouched
      var fileType = file.type || '';
      var fileName = file.name || 'compressed_image.jpg';
      var isImage = fileType.indexOf('image/') === 0 || /\.(jpg|jpeg|png|webp|bmp|tiff|heic)$/i.test(fileName);
      if (!isImage) {
        return resolve(file);
      }

      var opts = Object.assign({}, DEFAULT_OPTIONS, customOpts || {});

      // If file is below size threshold, return untouched
      if (file.size <= opts.thresholdBytes) {
        return resolve(file);
      }

      var reader = new FileReader();
      reader.onerror = function(err) { reject(err); };
      reader.onload = function(e) {
        var img = new Image();
        img.onerror = function(err) { reject(err); };
        img.onload = function() {
          try {
            var origW = img.naturalWidth || img.width;
            var origH = img.naturalHeight || img.height;
            var targetW = origW;
            var targetH = origH;

            // Scale down if larger than max dimensions, preserving ratio
            if (targetW > opts.maxWidth || targetH > opts.maxHeight) {
              var ratio = Math.min(opts.maxWidth / targetW, opts.maxHeight / targetH);
              targetW = Math.round(targetW * ratio);
              targetH = Math.round(targetH * ratio);
            }

            var canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            var ctx = canvas.getContext('2d', { alpha: true });

            // High-quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetW, targetH);

            // Determine output mime type
            var isPng = fileType === 'image/png' || /\.png$/i.test(fileName);
            var hasTransparency = isPng && hasAlphaChannel(ctx, targetW, targetH);

            var exportMime = opts.preferredFormat;
            if (hasTransparency) {
              // WebP supports transparency with outstanding compression
              exportMime = isWebPSupported ? 'image/webp' : 'image/png';
            } else {
              exportMime = isWebPSupported ? 'image/webp' : opts.fallbackFormat;
            }

            var exportQuality = (exportMime === 'image/png') ? undefined : opts.quality;

            canvas.toBlob(function(blob) {
              if (!blob) {
                return resolve(file); // fallback to original if toBlob fails
              }

              // Only use compressed if it actually reduced the size
              if (blob.size < file.size) {
                var newExt = exportMime === 'image/webp' ? '.webp' : (exportMime === 'image/png' ? '.png' : '.jpg');
                var newName = fileName.replace(/\.[^/.]+$/, '') + newExt;
                var compressedFile = new File([blob], newName, {
                  type: exportMime,
                  lastModified: Date.now()
                });

                resolve({
                  file: compressedFile,
                  wasCompressed: true,
                  originalSize: file.size,
                  compressedSize: blob.size,
                  savedBytes: file.size - blob.size,
                  savedPercent: Math.round(((file.size - blob.size) / file.size) * 100)
                });
              } else {
                resolve({
                  file: file,
                  wasCompressed: false,
                  originalSize: file.size,
                  compressedSize: file.size,
                  savedBytes: 0,
                  savedPercent: 0
                });
              }
            }, exportMime, exportQuality);
          } catch(err) {
            console.warn('[DH Compressor Error]', err);
            resolve(file); // fail-safe fallback
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Automatically process and compress an HTMLInputElement (type=file)
   * Replaces files in-place using DataTransfer
   */
  function handleFileInput(input, customOpts) {
    if (!input || !input.files || input.files.length === 0) return Promise.resolve();
    if (input.dataset.compressing === 'true') return Promise.resolve();

    var files = Array.prototype.slice.call(input.files);
    var needsCompression = files.some(function(f) {
      return (f.type.indexOf('image/') === 0 || /\.(jpg|jpeg|png|webp|bmp)$/i.test(f.name)) && f.size > (DEFAULT_OPTIONS.thresholdBytes);
    });

    if (!needsCompression) return Promise.resolve();

    input.dataset.compressing = 'true';

    var tasks = files.map(function(f) {
      return compressFile(f, customOpts);
    });

    return Promise.all(tasks).then(function(results) {
      var anyCompressed = false;
      var totalOriginal = 0;
      var totalCompressed = 0;
      var finalFiles = [];

      results.forEach(function(res) {
        if (res && res.file) {
          finalFiles.push(res.file);
          if (res.wasCompressed) {
            anyCompressed = true;
            totalOriginal += res.originalSize;
            totalCompressed += res.compressedSize;
          } else {
            totalOriginal += res.originalSize;
            totalCompressed += res.compressedSize;
          }
        } else if (res instanceof Blob) {
          finalFiles.push(res);
        }
      });

      if (anyCompressed) {
        try {
          var dt = new DataTransfer();
          finalFiles.forEach(function(f) { dt.items.add(f); });
          input.files = dt.files;
        } catch(dtErr) {
          console.warn('[DH Compressor DataTransfer not supported on this browser]', dtErr);
        }

        var savedPct = totalOriginal > 0 ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100) : 0;
        var msg = '<strong>Image Auto-Compressed:</strong> ' + formatBytes(totalOriginal) + ' ➔ ' + formatBytes(totalCompressed) + ' (' + savedPct + '% saved)';
        showToast(msg, '⚡');

        // Dispatch custom events
        input.dispatchEvent(new CustomEvent('image-compressed', {
          bubbles: true,
          detail: {
            originalSize: totalOriginal,
            compressedSize: totalCompressed,
            savedBytes: totalOriginal - totalCompressed,
            savedPercent: savedPct,
            files: finalFiles
          }
        }));
      }

      input.dataset.compressing = 'false';
      return finalFiles;
    }).catch(function(err) {
      input.dataset.compressing = 'false';
      console.warn('[DH Compressor Input Handler Error]', err);
    });
  }

  // Global change listener covering current & dynamically created file inputs
  document.addEventListener('change', function(e) {
    var target = e.target;
    if (target && target.tagName === 'INPUT' && target.type === 'file') {
      handleFileInput(target);
    }
  }, true);

  // Expose Global Public API
  window.DHCompressor = {
    version: '1.0',
    isWebPSupported: isWebPSupported,
    formatBytes: formatBytes,
    showToast: showToast,
    compressFile: function(file, options) {
      return compressFile(file, options).then(function(res) {
        return (res && res.file) ? res.file : res;
      });
    },
    compressFileDetails: compressFile,
    compressInput: handleFileInput,
    autoAttach: function(inputElement, options) {
      if (!inputElement) return;
      inputElement.addEventListener('change', function() {
        handleFileInput(inputElement, options);
      });
    }
  };

  console.log('⚡ [Digital Hunarmand] Image Auto-Compressor Engine Active (WebP: ' + (isWebPSupported ? 'supported' : 'fallback JPEG') + ')');

})(window, document);
