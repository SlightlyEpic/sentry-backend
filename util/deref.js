const $RefParser = require('@apidevtools/json-schema-ref-parser');
const fs = require('fs');

(async () => {
    fs.readdirSync('./src/ajvSchema').forEach(async file => {
        if(!file.endsWith('.json')) return;
        const schema = require(`../src/ajvSchema/${file}`);
        const deref = await $RefParser.dereference(schema);
        fs.writeFileSync(`./src/ajvSchema/${file}`, JSON.stringify(deref, null, 2));
        console.log(`Derefed ${file}`);
    });
})();
