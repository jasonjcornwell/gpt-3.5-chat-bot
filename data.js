const fs = require('fs')

//readFileSync ?

const userData = {
    userid: null,
    username: null,
    preferredName: null,
    mbti: null
}

function getData(userid){
  console.log('Getting data for:', userid)
    fs.readFile(`./data/${userid}.json`, "utf8", (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }
        try {
            const user = JSON.parse(jsonString);
            console.log("JSON data:", user);
            return user;
          } catch (err) {
            console.log("Error parsing JSON string:", err);
            return;
          }
      });
}

function setData(user){
  console.log('Setting data for:', user.userid)
    const jsonString = JSON.stringify(user, null, 2);

    console.log(jsonString);

    fs.writeFile(`./data/${user.userid}.json`, jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

function updateData(user){
    const jsonString = JSON.stringify(user, null, 2);

    console.log(jsonString);

    jsonReader("./data.json", (err, data) => {
        if (err) {
          console.log("Error reading file:", err);
          return;
        }
        // increase customer order count by 1
        customer.order_count += 1;
        fs.writeFile("./customer.json", JSON.stringify(customer), err => {
          if (err) console.log("Error writing file:", err);
        });
      });
}


module.exports = {
  getData,
  setData,
}