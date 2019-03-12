const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const BlockchainParser = require('./workers/blockchainParser');

server.listen(3002);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

const blockchainParser = new BlockchainParser();

io.on('connection', function (socket) {
    socket.join('buy');
    socket.join('sell');
    let interval = -1;

    socket.on('send', data => {
        blockchainParser.setTimer(data.timer * 1000);
        clearInterval(interval);
        interval = setInterval(() => {
            socket.emit('btc', blockchainParser.getData(data.currency))
        }, data.timer * 1000);
    });

    socket.on('message', data => {
        let { content, room } = data;
        if (room === 'buy' || room === 'sell') {
            socket.nsp.to(room).emit('message', {
                room,
                content
            })
        }
    });
});