import app from '../app';

export async function initServer(port: number) {
    app.listen(port, (error) => {
        if (error) {
            console.error('Error while listning on port:', port);
            throw error;
        }
        console.log('Server is listening on port:', port);
    });
}
