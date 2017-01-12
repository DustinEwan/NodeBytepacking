
import { Serialization, Models as CustomModels } from './serialization';
import * as net from 'net';

let socket = net.connect({
    host: 'localhost',
    port: 1337
});

let character: CustomModels.Character = {
    name: "Dustin",
    level: 53
};

socket.write(Serialization.Custom.Character.Serialize(character));

socket.write(Serialization.Custom.Login.Serialize({
    uniqueId: 1,
    password: 'test',
    username: 'dustin'
}));
