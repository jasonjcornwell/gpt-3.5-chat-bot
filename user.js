const fs = require('fs');

class User {
    constructor(data) {
        // Set default values for the properties
        this.username = null;
        this.nickname = null;
        this.callMe = null;
        this.mbti = null;
        this.age = null;
        this.gender = null;
        this.bio = null;
        this.chatSummary = null;
        // Dynamically assign the properties of the data object to the new instance
        Object.assign(this, data);
      }
  

      static getFromId(userid) {
        return new Promise((resolve, reject) => {
          console.log('Getting data for:', userid);
          fs.readFile(`./data/${userid}.json`, "utf8", (err, jsonString) => {
            if (err) {
              if (err.code === 'ENOENT') {
                console.log("File not found, creating an empty User object with userid:", userid);
    
                // Create a new User instance with only the userid
                const newUser = new User({ userid });
                resolve(newUser);
              } else {
                console.log("File read failed:", err);
                reject(err);
              }
              return;
            }
            try {
              const user = JSON.parse(jsonString);
              // Create a new User instance with the retrieved data using the spread operator
              const retrievedUser = new User({ ...user });
              resolve(retrievedUser);
            } catch (err) {
              console.log("Error parsing JSON string:", err);
              reject(err);
            }
          });
        });
      }

      update(newProperties) {
        // Merge the new properties with the existing properties
        Object.assign(this, newProperties);
      }

      save() {
        console.log('Setting data for:', this.userid);
        const jsonString = JSON.stringify(this, null, 2);
    
        fs.writeFile(`./data/${this.userid}.json`, jsonString, err => {
          if (err) {
            console.log('Error writing file', err);
          } else {
            console.log('Successfully wrote file');
          }
        });
      }

      getName() {
        return this.callMe ?? (this.nickname ?? this.username)
      }

      aboutMe() {
        let aboutMe = `Hi my name is ${this.nickname ?? this.username}`
        if(this.callMe) aboutMe += ` but you should call me ${this.callMe}`
        if(this.mbti) aboutMe += `. My MBTI type is ${this.mbti}`
        if(this.age) aboutMe += `. I am ${this.age} years old`
        if(this.gender) aboutMe += `. I am ${this.gender}`
        if(this.bio) aboutMe += `. ${this.bio}`
        return aboutMe + '.';
      }

}

module.exports = User;




// getUserData() {
//     console.log('Getting data for:', this.userid);
//     fs.readFile(`./data/${this.userid}.json`, "utf8", (err, jsonString) => {
//       if (err) {
//         console.log("File read failed:", err);
//         return;
//       }
//       try {
//         const user = JSON.parse(jsonString);
//         console.log("JSON data:", user);

//         // Update the userData object with the retrieved data
//         this.userid = user.userid;
//         this.username = user.username;
//         this.callMe = user.callMe;
//       } catch (err) {
//         console.log("Error parsing JSON string:", err);
//       }
//     });
//   }