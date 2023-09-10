// returns user's points 
// if user is a follower but they are not in the db, new instance created and value of initIncome returned

import {findOneAndUpdate} from './../db/findOneAndUpdate.js';
import {auth} from './../requests/auth.js';

export let points = ({user: {user_id, user_login}, user_type: {broadcaster}}) => 
	new Promise (async (res, rej) => {
		if(! await auth(user_id, broadcaster)) 
			return res(`For followers only`);
		let user = await findOneAndUpdate(user_id, user_login);
		return res(user.points);
	})
