const bcrypt = require("bcryptjs")
bcrypt.hash("HR001", 10).then(console.log)