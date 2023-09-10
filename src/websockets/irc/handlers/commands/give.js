import {getUserId} from './../requests/getUserId.js';
import {broadcasterAward} from './../db/broadcasterAward.js';

export let give = ({user_type: {broadcaster}, params}) => 
	new Promise (async (res, rej) => {

		if(!broadcaster) 
			return res('only for broadcaster');

		params = params?.toLowerCase();

		let [user_login, points] = params.split(' ');

		if (!points) points = 1000;
	
		if (isNaN(points) || !user_login) 
			return `!give [user_login] [bet]`;

		let user_id = await getUserId(user_login);

		let award = await broadcasterAward(user_id, parseInt(points));

		return res('Awarded');
		
	})
