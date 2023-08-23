# Use the latest Node.js LTS (Long Term Support) image as the base image
FROM node:lts

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the Express app will run on
EXPOSE 3000

# Set environment variables
ENV DATABASE_URL="postgresql://postgres:admin@localhost:5432/pafin?schema=public"
ENV DB_TYPE=prisma
ENV PORT=3000
ENV JWT_SECRET=秘密です
ENV ENVRIONMENT=development

# Command to start the Express app using ts-node
CMD ["npx", "ts-node", "src/index.ts"]
