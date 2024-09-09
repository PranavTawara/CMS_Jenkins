# Use the official Node.js image as a base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY backend/ .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
