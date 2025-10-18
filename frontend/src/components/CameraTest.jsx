import React, { useState } from 'react';
import { cameraPlugin, geolocationPlugin, checkPlugins } from '../utils/cordova-plugins';

const CameraTest = () => {
  const [imageData, setImageData] = useState(null);
  const [location, setLocation] = useState(null);
  const [plugins, setPlugins] = useState({});

  const handleTakePicture = async () => {
    try {
      const image = await cameraPlugin.takePicture();
      setImageData(image);
      console.log('Foto tirada:', image);
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      alert('Erro ao tirar foto: ' + error.message);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const image = await cameraPlugin.chooseFromGallery();
      setImageData(image);
      console.log('Imagem escolhida:', image);
    } catch (error) {
      console.error('Erro ao escolher imagem:', error);
      alert('Erro ao escolher imagem: ' + error.message);
    }
  };

  const handleGetLocation = async () => {
    try {
      const position = await geolocationPlugin.getCurrentPosition();
      setLocation(position);
      console.log('Localização obtida:', position);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      alert('Erro ao obter localização: ' + error.message);
    }
  };

  const handleCheckPlugins = () => {
    const availablePlugins = checkPlugins();
    setPlugins(availablePlugins);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Teste de Plugins Cordova</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Status dos Plugins:</h3>
        <button onClick={handleCheckPlugins} style={{ marginBottom: '10px' }}>
          Verificar Plugins
        </button>
        <div>
          <p>Câmera: {plugins.camera ? '✅ Disponível' : '❌ Não disponível'}</p>
          <p>Geolocalização: {plugins.geolocation ? '✅ Disponível' : '❌ Não disponível'}</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Câmera:</h3>
        <button onClick={handleTakePicture} style={{ marginRight: '10px' }}>
          Tirar Foto
        </button>
        <button onClick={handleChooseFromGallery}>
          Escolher da Galeria
        </button>
        
        {imageData && (
          <div style={{ marginTop: '10px' }}>
            <img 
              src={`data:image/jpeg;base64,${imageData}`} 
              alt="Captured" 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Geolocalização:</h3>
        <button onClick={handleGetLocation}>
          Obter Localização
        </button>
        
        {location && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0' }}>
            <p><strong>Latitude:</strong> {location.coords.latitude}</p>
            <p><strong>Longitude:</strong> {location.coords.longitude}</p>
            <p><strong>Precisão:</strong> {location.coords.accuracy}m</p>
            <p><strong>Timestamp:</strong> {new Date(location.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p><strong>Nota:</strong> Este componente funciona melhor no dispositivo Android. 
        No navegador, alguns plugins podem não estar disponíveis.</p>
      </div>
    </div>
  );
};

export default CameraTest;
