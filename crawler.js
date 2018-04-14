const axios = require('axios')
const cheerio = require('cheerio')
const qs = require('querystring')
const moment = require('moment')

exports.getUserPosts = async function getUserPosts(sval, bsn) {
	const REQ = axios.create({
		headers: {
			Cookie: `ckFORUM_bsn=${bsn}; ckFORUM_stype=author; ckFORUM_sval=${sval};`
		}
	})

	const lastpage = await (async () => {
		const { data } = await REQ.get(`https://forum.gamer.com.tw/Bo.php?${qs.stringify({ bsn, sval, stype: 2 })}`)
		const $ = cheerio.load(data)
		return parseInt(
			$(
				$('.BH-pagebtnA')
					.eq(0)
					.children()
					.toArray()
					.pop()
			).text()
		)
	})()
	let results = []
	for (let i = 1; i <= lastpage; i++) {
		const q = qs.stringify({ bsn, sval, stype: 2, page: i })
		const { data } = await REQ.get(`https://forum.gamer.com.tw/Bo.php?${q}`)
		const $ = cheerio.load(data)
		const articles = $('.FM-blist>tbody>tr:not([class])')
			.toArray()
			.map(x => ({
				title: $(x)
					.find('.FM-blist3')
					.text()
					.trim(),
				url: $(x)
					.find('.FM-blist3>a')
					.attr('href'),
				gp: (() => {
					const p = /\+(\d+)/.exec(
						$(x)
							.find('.FM-blist4')
							.text()
					)
					return p ? parseInt(p[1]) : 0
				})(),
				time: new Date(
					$(x)
						.find('.FM-blist6 a')
						.eq(0)
						.text()
						.replace('今日', moment().format('YYYY/MM/DD'))
						.replace(
							'昨日',
							moment()
								.subtract(1, 'd')
								.format('YYYY/MM/DD')
						)
				).getTime()
			}))
		results = results.concat(articles)
	}
	return results
}
