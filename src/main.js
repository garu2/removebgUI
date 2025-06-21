import './style.css'

// API endpoint for background removal
const REMOVE_BG_API_URL = import.meta.env.VITE_API_URL + '/remove-bg';

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const processingMessage = document.getElementById('processingMessage');
const imagePreview = document.getElementById('imagePreview');
const resultSection = document.getElementById('resultSection');
const originalImage = document.getElementById('originalImage');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');

// Mostrar imagen por defecto en el panel de vista previa
function setDefaultImage() {
  // Limpiar el contenido actual
  imagePreview.innerHTML = '';
  
  // Crear elemento de imagen
  const defaultImg = document.createElement('img');
  defaultImg.src = '/example01.png';
  defaultImg.alt = 'Example image';
  defaultImg.className = 'max-h-full max-w-full object-contain';
  
  // Añadir la imagen al contenedor
  imagePreview.appendChild(defaultImg);
}

// Cargar la imagen por defecto al iniciar
setDefaultImage();

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

// Handle the file input change event
fileInput.addEventListener('change', handleFiles, false);

// Handle the upload button click
uploadBtn.addEventListener('click', () => {
  fileInput.click();
});

// Handle the download button click
downloadBtn.addEventListener('click', downloadImage);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.classList.add('highlight');
}

function unhighlight() {
  dropArea.classList.remove('highlight');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles({ target: { files } });
}

function handleFiles(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file.type.match('image.*')) {
      processFile(file);
    } else {
      console.log('Please upload an image file');
    }
  }
}

async function processFile(file) {
  // Display original image
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    originalImage.src = e.target.result;
  };

  // Show processing message
  processingMessage.classList.remove('hidden');
  
  try {
    const formData = new FormData();
    formData.append('image', file);

    //console.log('Sending request to:', REMOVE_BG_API_URL);
    
    // Al usar el proxy de Vite, no necesitamos configuración especial de CORS
    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      body: formData
      // No necesitamos configurar CORS manualmente cuando usamos el proxy
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to remove background: ${response.status} ${response.statusText}`);
    }

    // Get the processed image from the response
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    // Update UI with the processed image
    resultImage.src = imageUrl;
    
    // Update preview
    imagePreview.innerHTML = '';
    const previewImg = document.createElement('img');
    previewImg.src = imageUrl;
    previewImg.className = 'max-h-full max-w-full object-contain';
    imagePreview.appendChild(previewImg);
    
    // Show results section
    resultSection.classList.remove('hidden');
  } catch (error) {
    console.error('Error:', error);
    console.log('Failed to remove background: ' + error.message);
  } finally {
    // Hide processing message
    processingMessage.classList.add('hidden');
  }
}

function downloadImage() {
  if (resultImage.src) {
    const link = document.createElement('a');
    link.href = resultImage.src;
    link.download = 'removed-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
