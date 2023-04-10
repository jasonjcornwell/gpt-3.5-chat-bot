const fs = require('fs')

//readFileSync ?

function getData(username){
    fs.readFile("./data.json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }
        try {
            const data = JSON.parse(jsonString);
            console.log("JSON data:", data);
          } catch (err) {
            console.log("Error parsing JSON string:", err);
            return;
          }
          const user = data.username
      });
}

function setData(user){
    const jsonString = JSON.stringify(user);
    console.log(jsonString);
}




fs.writeFileSync('./data.json', JSON.stringify(obj, null, 2) , 'utf-8');