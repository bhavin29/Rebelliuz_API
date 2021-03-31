

require('dotenv').config();

// config.js
module.exports = {
	app: {
		port: process.env.DEV_APP_PORT || 3000,
		appName: process.env.APP_NAME || 'iLrn',
		env: process.env.NODE_ENV || 'development',
	},
	db: {
		port: process.env.DB_PORT || 27016,
		dbPath: process.env.DB_PATH || 'mongodb://localhost/firstrest',
	//	dbPath: process.env.DB_PATH || 'mongodb+srv://test:test123@cluster0.e9yvt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority?authSource=admin&ssl=true' ,
	},
	winiston: {
		logpath: '/iLrnLogs/logs/',
	},
	auth: {
		jwt_secret: process.env.JWT_SECRET || 'vasturebelliuzhsepur',
		jwt_expiresin: process.env.JWT_EXPIRES_IN || '1d',
		saltRounds: process.env.SALT_ROUND || 10,
		refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'VmVyeVBvd2VyZnVsbFNlY3JldA==',
		refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRES_IN || '2d', // 2 days
	},
	sendgrid: {
		api_key: process.env.SEND_GRID_API_KEY,
		api_user: process.env.USERNAME,
		from_email: process.env.FROM_EMAIL || 'alaa.mezian.mail@gmail.com',
	},
	general:{
		content_path : process.env.CONTENT_PATH || 'D:\\Bhavin\\MyProject\\Rebelliuz\\Publish\\Content',
		log_path : process.env.LOG_PATH || 'D:\\Bhavin\\MyProject\\Rebelliuz\\Publish\\',
		rows_per_page : process.env.ROWS_PER_PAGE || 5,
		}
};
