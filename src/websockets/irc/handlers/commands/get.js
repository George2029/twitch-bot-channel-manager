import {pointsTitle, initIncome} from './config.js';
import {findOneAndUpdate} from './../db/findOneAndUpdate.js';
import {payroll} from './../db/payroll.js';
import {auth} from './../requests/auth.js';
import {performanceLog} from './../../../../utils/logger.js';

const notFollowerResponse = `Become a follower and take possession of ${initIncome} ${pointsTitle} right away!`;

const dayPassed = (timeOflastPointsReception) => { 
	let yesterday = new Date() - 3600 * 1000 * 24;
	return timeOflastPointsReception < new Date(yesterday);
}

export let get = ({user: {user_id, user_login}, user_type: {broadcaster, vip}}) =>
	new Promise (async (res, rej) => {
		let ts1 = performance.now();
		let authorized = await auth(user_id, broadcaster); 
		if (!authorized) 
			return res(notFollowerResponse);
		let user = await findOneAndUpdate(user_id, user_login);
		let notInCoolDown = dayPassed(user.last_points_reception); 
		if(!notInCoolDown)
			return res(`wait for the next stream`);
		let money = await payroll(user_id, vip);
		let ts2 = performance.now();
		performanceLog(`get`, Math.floor(ts2-ts1));
		return res(`+${money}`);
	})
