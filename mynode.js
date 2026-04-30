const fs = require('fs');
const path = require('path');
const successColor = '\x1b[32m%s\x1b[0m';
const errorColor = '\x1b[1;31m\x1b[0m';
const checkSign = '\u{2705}';
const dotenv = require('dotenv').config({path: 'src/.env'}); ;

const envConfigFile = `export const environment = {
    production: true,
    apiUrl: '${process.env.API_URL}',
    productImgUrl: '${process.env.PRODUCT_IMG_URL}',
};
`;
const targetPath = path.join(__dirname, './src/environments/environments.ts');

const envDirectory = path.join(__dirname, 'src/environments');
if (!fs.existsSync(envDirectory)) {
    fs.mkdirSync(envDirectory, { recursive: true });
}

fs.writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
        console.error(errorColor ,`! Erro ao gerar o env file`, err);
        throw err;
    } else {
        console.log(successColor, `${checkSign} environment.development.ts [gerado com sucesso]`);
    }
});