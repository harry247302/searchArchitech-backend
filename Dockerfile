# --- Build React/Vite App ---
    FROM node:18 AS build

    WORKDIR /
    
    # Install dependencies
    COPY  package*.json 
    RUN npm install
    
    
    # Copy the source files
    COPY . .
    
    
    # Set port
    EXPOSE 5173
    
    CMD ["npm", "start"]