import { io, Socket } from 'socket.io-client';
import { appConfig } from './config';

export const socket: Socket = io(appConfig.wsUrl, {
    transports: ['websocket'],
    withCredentials: true,
});
