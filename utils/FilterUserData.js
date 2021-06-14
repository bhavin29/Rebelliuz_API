module.exports = (user) => {
    return {
      id: user.id,
      displayname: user.displayname,
      email: user.email,
      connections: user.connections.map((connection) => ({
        id: connection._id,
        displayname:connection.displayname
      })),
    }
  }
  