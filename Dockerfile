FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Expose the app port (change if needed)
EXPOSE 5173

# Start the server
CMD ["npm", "start"]
