# Base image with Node.js
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if using npm) or yarn.lock (if using yarn)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

EXPOSE 80

# The default command to start the development server (if using create-react-app)
CMD ["npm", "start"]

