// start.js
import { exec } from 'child_process';

// Función para ejecutar comandos en la terminal
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando el comando: ${command}`);
        console.error(stderr);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}

// Función principal
async function start() {
  try {
    console.log('Compilando el frontend...');
    await runCommand('npm run build'); // Compila el frontend

    console.log('Iniciando el backend...');
    await runCommand('node app/api/index.js'); // Inicia el backend

    console.log('Aplicación lista para producción.');
  } catch (error) {
    console.error('Error durante el inicio:', error);
    process.exit(1); // Termina el proceso con un código de error
  }
}

// Ejecuta la función principal
start();
