import dotenv from 'dotenv';
dotenv.config();

import { boot } from './boot/boot';
import { bootstrap } from './boot/bootstrap';
import { initServer } from './boot/initServer';

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await boot(); //loads initial services
        await bootstrap(); // runs operations before starting the application
        await initServer(Number(PORT)); // initializes the server and starts listening on the specified port
    } catch (error) {
        console.error('Error during server initialization:', error);
        process.exit(1); // Exit the process with failure
    }
})();
