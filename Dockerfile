# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the application's dependencies
RUN npm install

# Copy the remaining application files
COPY . .

# Build the application
RUN npm run build

# Change the start command to run the JavaScript files
CMD ["node", "dist/app.js"]

# Expose the application's listening port
EXPOSE 3000