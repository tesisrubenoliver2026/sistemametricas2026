const { Service } = require('node-windows');

const svc = new Service({
  name: 'Mi Servidor Node',
  description: 'Servidor de ventas',
  script: 'C:\\SIS_VENTAS_NEXT\\server-desa\\server.js'
});

svc.on('install', function(){
  console.log('Servicio instalado correctamente');
  svc.start();
});

svc.install();