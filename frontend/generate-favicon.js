const favicons = require('favicons');
const fs = require('fs');
const path = require('path');

// Configuração do favicon
const source = path.join(__dirname, 'public', 'logo-alca-hub.png');
const destination = path.join(__dirname, 'public');

favicons(source, {
  path: '/',
  appName: 'Alça Hub',
  appShortName: 'Alça Hub',
  appDescription: 'Plataforma de Serviços',
  developerName: 'Alça Hub',
  developerURL: null,
  dir: 'auto',
  lang: 'pt-BR',
  background: '#ffffff',
  theme_color: '#3B82F6',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  start_url: '/',
  version: '1.0',
  logging: false,
  pixel_art: false,
  loadManifestWithCredentials: false,
  manifestMaskable: false,
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: true,
    coast: false,
    favicons: true,
    firefox: false,
    windows: true,
    yandex: false
  }
}, (error, response) => {
  if (error) {
    console.error('Erro ao gerar favicon:', error);
    return;
  }

  // Salvar arquivos
  response.images.forEach(image => {
    fs.writeFileSync(path.join(destination, image.name), image.contents);
  });

  response.files.forEach(file => {
    fs.writeFileSync(path.join(destination, file.name), file.contents);
  });

  console.log('Favicon gerado com sucesso!');
});
