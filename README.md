## Requisiti

    - Avere docker installlato
    - Avere docker-compose installato

## Avvertenze

Per lanciare l'applicativo usare il comando './bin/start.sh' direttamente dalla cartella root: lo script è pensato per funzionare su sistemi UNIX, nel caso di utilizzo di sistemi Windows copiare il comando docker-compose all'interno dello script e lanciarlo manualmente.

L'applicato Backend gira su porta 8000 su localhost.

Per fermale lo stack applicativo usare il comando 'bin/stop.sh'.

Per la documentazione API dell'applicativo backend andare su http://localhost:8000/docs#/ in cui sarà visibile lo Swagger.

Nel caso in cui si voglia utilizzare Docker per il deploy finale del progetto, utilizzare la cartella "frontend" (in cui viene fornito un Dockerfile di esempio) e togliere i commenti nel docker-compose.yml per la parte dell'applicativo frontend.

# Front-End Application

## Framework

This project is built using the **Angular** framework.

## Versions

- **Angular**: 18.2.3
- **Chart.js**: ^3.9.1
- **ng2-charts**: 7.0.0
- **RxJS**: ~7.8.0
- **Node**: 20.13.1 (Alpine version for lightweight Docker usage)

## Deployment

The application can be deployed using a `Dockerfile`.

## Starting the Application

### Development Mode

To start the application in development mode, use the following commands:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   ng serve
   ```

This will start the application on `http://localhost:4200`.

### Build the Application

To build the project for production, use:

```bash
ng build
```

### Using Dockerfile

To start the application using the provided `Dockerfile`, follow these steps:

1. Navigate to the project directory (`test_tecnico`):

   ```bash
   cd test_tecnico
   ```

2. Run the following command to build and start the application:
   ```bash
   docker compose up
   ```

This will run the application in a production-like mode. Note that this is not a fully optimized production environment.

## Connection

After starting the application using Docker, connect to it using the following URL:

**Local URL:** [http://localhost:4200](http://localhost:4200)

Enjoy exploring the application!
