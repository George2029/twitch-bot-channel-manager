import {users} from './index.js';

export let broadcasterAward = (user_id, points) => 
	users.updateOne(
			{user_id}, 
			{$inc: 
				{points: parseInt(points)}
			}
		);

