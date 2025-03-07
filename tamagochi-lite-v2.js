// created by hxd57. V2
var pastelColors = {
  "Peach": color(255, 223, 186),
  "Mint": color(186, 255, 201),
  "Pink": color(255, 186, 255),
  "Blue": color(186, 225, 255),
  "Yellow": color(255, 255, 186),
  "White": color(255, 255, 255)
};
var currentBgColor = pastelColors["Peach"]; // Default background
var faceColor = color(0, 0, 0); // Default face color (black)

function Pet(name, type, hunger, cleanliness, happiness, timeLastFed, timeLastPet) {
  this.name = name || "gotchi"; // Changed default name to "gotchi"
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
    var jsonString = JSON.stringify(petData) + "\n"; // Keep the newline
    storageWrite("pet.json", jsonString); // Append to the file
  }
};

function loadPet() {
  var data = storageRead("pet.json") || storageRead("../pet.json"); // Check both locations
  if (data) {
    try {
      // Split the file into lines
      var lines = data.split("\n");
      // Filter out empty lines
      var nonEmptyLines = [];
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].trim() !== "") {
          nonEmptyLines.push(lines[i]);
        }
      }
      // Get the last non-empty line
      var lastLine = nonEmptyLines[nonEmptyLines.length - 1];
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
  var textYSpacing = 15;
  
  var faces = {
    cat: [" >_< ", "=^_^=", " ^-^ "],
    dog: [" T_T ", " o_o ", " ^_^ "],
    bird: [" x_x ", " -_- ", " ^v^ "]
  };

  fillScreen(currentBgColor);
  setTextColor(faceColor); // Use configurable face color
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

function showHeartAnimation() {
  var screenWidth = width();
  var screenHeight = height();
  var heartText = "[pet says] I <3-<3 You !!";
  var heartWidth = heartText.length * 12;
  var heartX = Math.floor((screenWidth - heartWidth) / 2);
  var heartY = Math.floor(screenHeight * 0.5);

  // Save the current background color
  var savedBgColor = currentBgColor;

  // Temporarily change the background color to white for the animation
  fillScreen(color(255, 255, 255));
  setTextColor(color(255, 0, 0)); // Red heart
  setTextSize(2);

  // Draw the heart
  drawString(heartText, heartX, heartY);

  // Wait for 1 second
  delay(1000);

  // Restore the original background color
  fillScreen(savedBgColor);
}

var pet = loadPet();

if (!pet) {
  fillScreen(currentBgColor);
  setTextColor(faceColor);
  setTextSize(2);
  var name = keyboard("", 12, "Pet's name?") || "gotchi"; // Default to "gotchi"
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
      "Heart", "heart",
      "Settings", "settings",
      "New Pet", "newpet",
      "Exit", "exit"
    ]) || "";
    
    if (choice === "exit") break;
    
    if (choice === "settings") {
      var setting = dialogChoice([
        "Change BG Color", "bgcolor",
        "Face Color", "facecolor",
        "Back", "back"
      ]);
      
      if (setting === "bgcolor") {
        var colorChoice = dialogChoice([
          "Peach", "Peach",
          "Mint", "Mint",
          "Pink", "Pink",
          "Blue", "Blue",
          "Yellow", "Yellow",
          "White", "White"
        ]);
        if (colorChoice && pastelColors[colorChoice]) {
          currentBgColor = pastelColors[colorChoice];
        }
      }
      else if (setting === "facecolor") {
        var fc = dialogChoice([
          "Black", "black",
          "White", "white"
        ]);
        faceColor = (fc === "white") ? color(255,255,255) : color(0,0,0);
      }
    }
    else if (choice === "newpet") {
      // Ask if the user is sure
      var confirm = dialogChoice([
        "Yes (will delete old pet)", "yes",
        "No (cancel)", "no"
      ]);
      
      if (confirm === "yes") {
        // Delete old pet files
        serialCmd("storage remove JS-scripts/bruce_0.sub");
        serialCmd("storage remove pet.json");
        
        // Create a new pet
        fillScreen(currentBgColor);
        setTextColor(faceColor);
        setTextSize(2);
        var name = keyboard("", 12, "Pet's name?") || "gotchi"; // Default to "gotchi"
        var type = dialogChoice(["Cat", "cat", "Dog", "dog", "Bird", "bird"]) || "cat";
        pet = new Pet(name, type);
        pet.save();
      }
    }
    else if (choice === "heart") {
      showHeartAnimation(); // Show the heart animation
    }
    else if (choice && pet[choice]) {
      pet[choice]();
      delay(1000);
    }
    pet.save();
  }
  
  delay(500);
}