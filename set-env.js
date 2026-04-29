const fs = require('fs');
const targetPath = './src/environments/environment.production.ts';

const envConfigFile = `export const environment = {
   production: true,
   apiUrl: '${process.env.API_URL}',
   productImgUrl: '${process.env.IMG_URL}'
};
`;

fs.writeFile(targetPath, envConfigFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(`Arquivo de ambiente gerado dinamicamente no caminho: ${targetPath}`);
    }
});