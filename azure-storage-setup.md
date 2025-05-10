# Azure Blob Storage Setup for Resume Ranker

1. Log in to the Azure Portal.
2. Create a new Storage Account.
3. Inside the Storage Account, create a Blob Container for storing resumes and FAISS index files.
4. Generate a Shared Access Signature (SAS) token or use Access Keys for secure access.
5. Update your backend configuration to use Azure Blob Storage SDK with the connection string or SAS token.
6. Set appropriate permissions and lifecycle management policies for data retention.
7. Test uploading and retrieving files from Blob Storage to ensure proper integration.

This setup provides scalable and durable storage for your application data on Azure.
