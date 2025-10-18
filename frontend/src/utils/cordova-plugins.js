// Utilitários para plugins Cordova no Alca Hub
// Exemplo de uso dos plugins instalados

// Plugin de Câmera
export const cameraPlugin = {
  // Tirar foto
  async takePicture(options = {}) {
    if (window.navigator.camera) {
      return new Promise((resolve, reject) => {
        window.navigator.camera.getPicture(
          (imageData) => resolve(imageData),
          (error) => reject(error),
          {
            quality: 75,
            destinationType: window.Camera.DestinationType.DATA_URL,
            sourceType: window.Camera.PictureSourceType.CAMERA,
            ...options
          }
        );
      });
    }
    throw new Error('Plugin de câmera não disponível');
  },

  // Escolher da galeria
  async chooseFromGallery(options = {}) {
    if (window.navigator.camera) {
      return new Promise((resolve, reject) => {
        window.navigator.camera.getPicture(
          (imageData) => resolve(imageData),
          (error) => reject(error),
          {
            quality: 75,
            destinationType: window.Camera.DestinationType.DATA_URL,
            sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
            ...options
          }
        );
      });
    }
    throw new Error('Plugin de câmera não disponível');
  }
};

// Plugin de Geolocalização
export const geolocationPlugin = {
  // Obter posição atual
  async getCurrentPosition(options = {}) {
    if (window.navigator.geolocation) {
      return new Promise((resolve, reject) => {
        window.navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
            ...options
          }
        );
      });
    }
    throw new Error('Plugin de geolocalização não disponível');
  },

  // Monitorar posição
  async watchPosition(callback, options = {}) {
    if (window.navigator.geolocation) {
      return window.navigator.geolocation.watchPosition(
        callback,
        (error) => console.error('Erro de geolocalização:', error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
          ...options
        }
      );
    }
    throw new Error('Plugin de geolocalização não disponível');
  }
};

// Verificar se plugins estão disponíveis
export const checkPlugins = () => {
  const plugins = {
    camera: !!window.navigator.camera,
    geolocation: !!window.navigator.geolocation
  };
  
  console.log('Plugins Cordova disponíveis:', plugins);
  return plugins;
};

// Inicializar plugins quando o app carregar
export const initPlugins = () => {
  // Aguardar o Cordova estar pronto
  if (window.cordova) {
    document.addEventListener('deviceready', () => {
      console.log('Cordova plugins carregados:', checkPlugins());
    }, false);
  } else {
    console.log('Executando no navegador - plugins Cordova não disponíveis');
  }
};
