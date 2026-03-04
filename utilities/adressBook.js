
function writeAdress(key, name) {
    var obj = {
    table: []
    };

    obj.table.push({key: key, name:name});

    fs.writeFile('myjsonfile.json', json, 'utf8', callback);
}
