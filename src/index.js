import 'dotenv/config';
import validate from './auth/validate.js';
import EventSubWebSocket from './websockets/esws.js';

let {app_name, bot, broadcaster} = process.env;

await validate(app_name, bot);
await validate(app_name, broadcaster);

setInterval( ()=> {
	validate(app_name, bot); 
	validate(app_name, broadcaster)
}, 15*60*1000); // validate every 15 min

const esws = new EventSubWebSocket('wss://eventsub.wss.twitch.tv/ws');

