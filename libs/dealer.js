class Dealer {
  constructor(io) {
    io.origins(process.env.SOCIAL_RESISTANCE_ADDRESS);
    io.on('connection', socket => {
      socket.emit('hoge', {hello: 'world'});
      socket.on('piyo', payload => {
        console.log(payload)
      });
    });
  }
}

module.exports = Dealer;