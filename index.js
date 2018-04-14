const { getUserPosts } = require('./crawler')

if (require.main === module) {
	const args = process.argv.slice(2)
	if (args.length < 2) {
		process.exit(1)
	}
	const [bsn, sval] = args

	getUserPosts(sval, bsn).then(r => console.log(JSON.stringify(r)))
}
exports.getUserPosts = getUserPosts
