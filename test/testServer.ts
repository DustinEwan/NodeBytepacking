
import { Serialization, Models as CustomModels } from './serialization';
import * as net from 'net';

Serialization.Handlers.Character = (character: CustomModels.Character) => {
    console.log(character);
}

net.createServer((socket) => {
    console.log("Client Connected.");
    socket.on('end', () => {
        console.log("Client disconnected.");
    });

    socket.on('data', (data: Buffer) => {
        console.log(data);
        console.log(data.length + " bytes.");
        Serialization.Demarshall(data);
    }).on('error', (error) => { console.log(error.message); });
}).on('error', (error) => { console.log(error.message); }).listen({
  host: 'localhost',
  port: 1337  
});
