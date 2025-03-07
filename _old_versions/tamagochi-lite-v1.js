// created by hxd57. V1 
function Pet(name, type, hunger, cleanliness, happiness, timeLastFed, timeLastPet) {
  this.name = name || "Pet";
  this.type = type || "cat";
  this.hunger = hunger !== undefined ? hunger : 0;
  this.cleanliness = cleanliness !== undefined ? cleanliness : 50;
  this.happiness = happiness !== undefined ? happiness : 50;
  var time = now();
  this.timeLastFed = timeLastFed || time;
  this.timeLastPet = timeLastPet || time;
}

Pet.prototype = {
  feed: function() {
    this.hunger = 0;
    this.timeLastFed = now();
    this.happiness = Math.min(100, this.happiness + 10);
    dialogMessage(this.name + " has been fed!");
  },
  clean: function() {
    this.cleanliness = Math.min(100, this.cleanliness + 20);
    dialogMessage(this.name + " is now clean!");
  },
  pet: function() {
    this.happiness = Math.min(100, this.happiness + 20);
    this.timeLastPet = now();
    dialogMessage(this.name + " loves your petting!");
  },
  updateHunger: function() {
    var time = now();
    var elapsed = time - this.timeLastFed;
    this.hunger = Math.min(100, Math.floor(elapsed / 720000) * 10);
  },
  updateHappiness: function() {
    var time = now();
    var elapsed = time - this.timeLastPet;
    this.happiness = Math.max(0, this.happiness - Math.floor(elapsed / 3600000) * 5);
  },
  save: function() {
    var petData = {
  	name: this.name,
  	type: this.type,
  	hunger: this.hunger,
  	cleanliness: this.cleanliness,
  	happiness: this.happiness,
  	timeLastFed: this.timeLastFed,
  	timeLastPet: this.timeLastPet
    };
    var jsonString = JSON.stringify(petData) + "\n"; // Add newline
    storageWrite("pet.json", jsonString);
}
};


function loadPet() {
  var data = storageRead("pet.json") || storageRead("../pet.json"); // Check both locations
  if (data) {
    try {
      // Split the file into lines
      var lines = data.split("\n");
      // Filter out empty lines
      var nonEmptyLines = lines.filter(function(line) {
        return line.trim() !== "";
      });
      // Get the last non-empty line
      var lastLine = nonEmptyLines.pop();
      if (lastLine) {
        var obj = JSON.parse(lastLine);
        return new Pet(obj.name, obj.type, obj.hunger, obj.cleanliness, 
                       obj.happiness, obj.timeLastFed, obj.timeLastPet);
      }
    } catch (e) {
      dialogError("Failed to load pet data: " + e.message);
      return null;
    }
  }
  return null; // No pet file found
}


function drawPet(pet) {
  var screenWidth = width();
  var screenHeight = height();
  var textYSpacing = 20; 
  
  var faces = {
    cat: [" >_< ", "=^_^=", " ^-^ "],
    dog: [" T_T ", " o_o ", " ^_^ "],
    bird: [" x_x ", " -_- ", " ^v^ "]
  };

  fillScreen(color(255, 242, 143));
  setTextColor(color(0, 0, 0));
  setTextSize(2); 

  var stateIndex = (pet.hunger >= 70 || pet.happiness <= 30) ? 0 : 
                   (pet.hunger >= 30 || pet.happiness <= 50) ? 1 : 2;
  
  var face = faces[pet.type][stateIndex];
  var faceWidth = face.length * 12; 
  var faceX = Math.floor((screenWidth - faceWidth) / 2);
  var faceY = Math.floor(screenHeight * 0.3);

  var time = now();
  if (time % 4000 < 200) {
    face = face.replace(/[^\s]/g, "－");
  }
  if (stateIndex === 2 && time % 1000 < 500) {
    faceX += Math.sin(time / 200) * (screenWidth * 0.1);
  }

  drawString(face, faceX, faceY); 
  drawString(face, faceX + 1, faceY); // Slight offset to simulate boldness

  var happyText = "Happy: " + pet.happiness + "%";
  var happyWidth = happyText.length * 12; 
  var happyX = Math.floor((screenWidth - happyWidth) / 2);
  drawString(happyText, happyX, 10);

  var statusY = screenHeight - 80; 
  drawString("Hngr: " + pet.hunger + "%", 10, statusY);
  drawString("Clean: " + pet.cleanliness + "%", 10, statusY + textYSpacing);

  var fedHrs = Math.floor((time - pet.timeLastFed) / 3600000);
  var petHrs = Math.floor((time - pet.timeLastPet) / 3600000);
  drawString("Fed:" + fedHrs + "h  Pet:" + petHrs + "h", 10, screenHeight - 30);
}


var pet = loadPet();

if (!pet) {
  fillScreen(color(255, 242, 143));
  setTextColor(color(0, 0, 0));
  setTextSize(2);
  var name = keyboard("", 12, "Pet's name?") || "Pet";
  var type = dialogChoice(["Cat", "cat", "Dog", "dog", "Bird", "bird"]) || "cat";
  pet = new Pet(name, type);
  pet.save();
}

while (true) {
  pet.updateHunger();
  pet.updateHappiness();
  
  drawPet(pet);
  
  if (getNextPress()) {
    var choice = dialogChoice([
      "Pet", "pet",
      "Feed", "feed",
      "Clean", "clean",
	  "Save", "save",
      "Exit", "exit"
    ]) || "";
    
    if (choice === "exit") break;
    if (choice && pet[choice]) {
      pet[choice]();
      delay(1000); 
    }
    pet.save();
  }
  
  delay(500); 
}