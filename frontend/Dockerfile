# Use the official Node.js image as a base
FROM node:18 as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY frontend/ .

# Build the React app
RUN npm run build

# Use a lighter image to serve the built React app
FROM nginx:alpine

# Copy the built React app to the nginx server
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run nginx
CMD ["nginx", "-g", "daemon off;"]
