import ws from 'ws';
import logger from './../utils/logger.js';
import InternetRelayChatWebSocket from './irc/index.js';
import {users} from './irc/handlers/db/index.js';
import {internetCheck} from './../utils/internetCheck.js';

class EventSubWebSocket extends ws {

	static counter = 0;
	static ircws = null;

	constructor (url) {
		super(url);
		this.on('open', this.onOpen);
		this.on('message', this.onMessage);
		this.on('close', this.onClose);
		this.on('error', this.onError);
	}

	async onOpen () {
		EventSubWebSocket.counter++;
		logger('esws', `Connected: ${EventSubWebSocket.counter}`, 'good');
		if(!EventSubWebSocket.ircws) {
			EventSubWebSocket.ircws = await new InternetRelayChatWebSocket('ws://irc-ws.chat.twitch.tv:80')
			EventSubWebSocket.ircws.on('reconnect', ()=>{EventSubWebSocket.ircws = EventSubWebSocket.ircws.newConnection;}) 
		}
	}

	async onClose(code) {
		logger('esws', `CLOSED: ${EventSubWebSocket.counter}: ${code}`, 'error');
		clearTimeout(this.pingTimeout);
		clearTimeout(this.keepaliveTimeout);
		let reconnect_url = this.reconnect_url ? this.reconnect_url : 'wss://eventsub.wss.twitch.tv/ws';
		await internetCheck();
		this.newConnection = new EventSubWebSocket(reconnect_url);
	}
	
	onError(err) {
		console.log('AAAAAAAAAA ERRRRRRRRRRRRRRRRRRRRRRRRRROOOOOOOOOOOOORRRRRRRRRR');
		console.log(err);
		this.close();
	}

	onKeepalive(message_type, theme) {
		if(message_type) logger('esws', message_type, theme);
		clearTimeout(this.keepaliveTimeout);
		this.keepaliveTimeout = setTimeout(()=>{
			logger('esws', `Didn't receive any keepalive or notification messages for more than 15s`, 'error');
			this.terminate();
		}, 15000);	
	}	

	async onMessage (msg) {
		let {metadata, payload} = JSON.parse(msg.toString());
		let {message_type} = metadata;
		if (message_type=='session_keepalive') return this.onKeepalive();
		if (message_type === 'session_welcome') {
			logger('esws', 'session_welcome', 'good');
			process.env.event_sub_session_id = payload.session.id;
			let	subscription_payload = {
				type: 'channel.follow',
				version: 2,
				condition: {
					broadcaster_user_id: process.env.broadcaster_id,
					moderator_user_id: process.env.bot_id
				},
				transport: {
					method: 'websocket',
					session_id: process.env.event_sub_session_id
				},
			}
			// console.log(subscription_payload);
			let url = 'https://api.twitch.tv/helix/eventsub/subscriptions';
			return fetch(url, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'client-id': process.env.client_id,
					'Authorization': `Bearer ${process.env[`${process.env.bot}_access_token`]}`
				},
				body: JSON.stringify(subscription_payload)
			})
			.then(r=>r.json()
				.then(data => {
					let {status, type} = data.data[0];
					logger(`esws`, `${type}: ${status}`, 'good' )
				})
			);
		}
		if (message_type == 'notification') {
			let {subscription: {type}, event} = payload;
			logger('esws', type, 'good');
			if(type == 'channel.follow') {
				let {user_id, user_login} = payload.event;
				return this.onFollow(user_id, user_login);
			}
		} 
		if(message_type == 'session_reconnect') {
			logger('esws', 'SESSION_RECONNECT_MESSAGE', 'error');
			let {session} = payload;
			this.reconnect_url = session.reconnect_url;
			return this.close(); // as connection either has already died or will die in 30s~
		}
		console.log(metadata, payload);
	}
	async onFollow(user_id, user_login) {
		let saying = `${user_login} is a follower now!`;
		this.onKeepalive(saying, 'good');
		let exFollower = await users.findOne({user_id});
		if (exFollower) {
			return EventSubWebSocket.ircws.say(`Welcome back, ${user_login}!`);
		} else {
			let newFollower = await users.insertOne({
				user_id, 
				user_login, 
				points: 1000, 
				last_points_got_at: new Date(),  
				smurfs:[user_login],
				followed_at: new Date(), 
			})
			saying += ` They got 1000 Clon Coins to use!`;
			EventSubWebSocket.ircws.say(saying);
		}
		
	}
}
export default EventSubWebSocket;
