const fs = require("fs");
const path = require("path");

const npmrcContent = `@mrmagic2020:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${process.env.NPM_AUTH_TOKEN}
`;

fs.writeFileSync(path.join(__dirname, ".npmrc"), npmrcContent);
