FROM node:18.16.1


#work directory 
WORKDIR /src/app

#install dependencies
COPY package*.json ./

#build the app
RUN npm install

#copy all files
COPY . .

#run the app
CMD [ "npm" , "start" ]

#set environment variables
ENV PORT=3000
ENV CONNECTION_URL_HOST=mongodb+srv://elhosinymarwan29:0162105511@maro-1.udxzsgv.mongodb.net/eCommerce