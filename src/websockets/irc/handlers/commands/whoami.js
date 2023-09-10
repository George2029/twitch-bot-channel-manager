// returns user's grade depending on how long they were a follower;

import {getFollower} from './../requests/getFollower.js';

export let whoami = ({user: {user_id}}) =>
	new Promise (async (res, rej) => {
			let follower = await getFollower(user_id);
			if (!follower.length) {
				return res(`not even a follower..`);
			} else {
				let time_of_follow  = new Date(follower[0].followed_at);
				if(time_of_follow > new Date(2023, 0)) {
					return res('Young boy!');
				} else if (time_of_follow < new Date(2022, 0)) {
					return res(`Middle old!`)
				} else if (time_of_follow < new Date(2021, 0)) {
					return res(`Honoured oldman!`) 
				} else {
					return res(`Grand Old. Bruh, you were at the beginning..`);
				}
			}
	})
