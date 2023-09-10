import {performanceLog} from './../../../../utils/logger.js';

export let title = ({user_type: {vip, broadcaster}, params}) =>

	new Promise( async (res, rej) => {
		if(!(vip || broadcaster)) return res('For vips only');
		if(!params) return;
		let url = new URL('https://api.twitch.tv/helix/channels');
		url.search = new URLSearchParams([
			['broadcaster_id', process.env.broadcaster_id]
		]);
		let body = JSON.stringify(
			{
				title: params.slice(0, 140)
			}
		);
		let ts1 = performance.now();
		let result = await fetch(url, 
			{
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${process.env[`${process.env.broadcaster}_access_token`]}`,
					'client-id': process.env.client_id,
					'content-type': 'application/json'
				},
				body
			}
		)
		let ts2 = performance.now();
		performanceLog(`title`, Math.floor(ts2-ts1));
		return res('done');
	});
			
