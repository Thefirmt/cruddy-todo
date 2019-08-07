const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const fsPromise = Promise.promisifyAll(require('fs'));

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) =>{
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) =>{
      if (err){
        throw err;
      }else{
        callback(err, {id, text});
      }
    });
  });

  // var id = counter.getNextUniqueId();
  // items[id] = text;
  // callback(null, { id, text });
};

exports.readAll = (callback) => {
  return fsPromise.readdirAsync(exports.dataDir)
    .then((list) => {
      return _.map(list, (filename) => {
        var number = filename.match(/[0-9]/gi).join("");
        return fsPromise.readFileAsync(path.join(exports.dataDir, `${number}.txt`))
          .then((data) => {
            data = data.toString('utf8');
            return ({id: number, text: data});
          });
      });
    }).then((file) => {
      return Promise.all(file);
    })
    .then((todo) => callback(null, todo));
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err, file)=>{
    if (err){
      callback(err, null);
    }else{
      var text = file.toString('utf8');
      callback(err, {id, text});
    }
  });

  // var text = items[id];
  // if (!text) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback(null, { id, text });
  // }
};

exports.update = (id, text, callback) => {
  var location = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(location, (err, file) =>{
    if (err){
      callback(err, null);
    }
    fs.writeFile(location, text, (err) =>{
      if (err){
        callback(err, null);
      }else{
        callback(err, {id, text});
      }
    });
  });
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  fs.unlink(`${exports.dataDir}/${id}`, (err, data) =>{
    if (err){
      callback("there is an error");
    }else{
      callback(err, data);
    }
  });
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
