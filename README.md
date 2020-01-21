This project is an application skeleton for a typical Node.js web app.


## Getting Started
To get you started you can simply clone the repository:

```
git clone https://github.com/vaishnavisantosh/NodeAssignment
```
and install the dependencies
```
npm install
```

### Prerequisites

A number of node.js tools is necessary to initialize and test the project. You must have node.js and its package manager (npm) installed. You can get them from  [http://nodejs.org/](http://nodejs.org/). The tools/modules used in this project are listed in package.json and include express, mongodb and mongoose.

#### MongoDB
The project uses MongoDB as a database. You can get it from [https://www.mongodb.com/download-center/community].

### Start the MongoDB server
First we need to create the `db` directory where the database files will live in. In your terminal navigate to the `root` of your system by doing `cd ..` until you reach the top directory. You can create the directory by running `sudo mkdir -p /data/db`. Now open a different tab in your terminal and run `mongod` to start the Mongo server.

### Run the Application

The project is preconfigured with a simple development web server and nodemon. The simplest way to start this server is:

    npm start
     or
    nodemon 


