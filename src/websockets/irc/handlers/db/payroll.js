import {users} from './index.js';
import {regularIncome, vipIncome} from './../commands/config.js';

export let payroll = (user_id, vip) =>
	new Promise ( async (res, rej) => {

		let points = vip ? vipIncome : regularIncome; 
		let ts1 = performance.now();
		await users.updateOne(
			{user_id},
			{
				$inc: {
					points, 
				},
				$set: {
					last_points_reception: new Date()
				}
			}
		);
		let ts2 = performance.now();
		let reqTime = Math.floor(ts2-ts1);
		console.log(reqTime);
		return res(points);
	});

