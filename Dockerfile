FROM node:20.11.1
 
RUN mkdir -p /home/app
 
WORKDIR /home/app

COPY package*.json ./

RUN npm install
 
COPY . .
 
EXPOSE 8000
 
CMD ["npm", "start"]