# Deployment Instructions for Resume Ranker Beta

## Prerequisites
- Docker and Docker Compose installed on your deployment server
- Access to the server terminal or CI/CD pipeline

## Build and Run
1. Clone the repository to your server.
2. Place the provided Dockerfiles and docker-compose.yml in the root directory.
3. Run the following command to build and start the services:
   ```
   docker-compose up --build -d
   ```
4. Backend API will be available at http://localhost:8000
5. Frontend will be available at http://localhost:3000

## Data Persistence
- Resume files and FAISS index data are persisted in the `resume-ranker/data` and `resume-ranker/resumes` directories mounted as volumes.

## Environment Variables
- Configure environment variables as needed in the docker-compose.yml or use a `.env` file.

## Logs and Monitoring
- Use `docker-compose logs -f` to view logs.
- Consider integrating monitoring tools for production.

## Next Steps
- Set up HTTPS with a reverse proxy (e.g., Nginx).
- Configure domain and DNS.
- Implement authentication and security enhancements.

For any issues or further customization, please refer to the project documentation or contact the development team.
