class Dealer {
  constructor(io) {
    this.io = io;
    this.io.origins(process.env.SOCIAL_RESISTANCE_ADDRESS);
  }

  start() {
    this.io.on('connection', socket => {
      socket.emit('hoge', {hello: 'world'});
      socket.on('piyo', payload => {
        console.log(payload)
      });
    });
  }
}

module.exports = Dealer;
