const config = require('../config/appconfig');
const UserPhoto = require('../api/models/storageFileModel');
let path =  config.general.parent_root;
module.exports = (user) => {
    return {
      _id: user.id,
      user_id : user.user_id,
      username : user.username,
      displayname: user.displayname,
      status : user.status,
      photo_id : user.photo_id,
      email: user.email,
      root_path : path,
      connections: user.connections.map((connection) => ({
        id: connection._id,
        displayname:connection.displayname
      })),
    }
  }
  