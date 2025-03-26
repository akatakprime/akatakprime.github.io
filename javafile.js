// SYMBOL VARIABLES & MAZE DIMENSIONS -----------------------------------
var or_maze_dimensions_x = 20;
var or_maze_dimensions_y = 20;
var maze_dimensions_x = 20;
var maze_dimensions_y = 20;

var empty_color = "white";
var empty_symbol = "";
var empty_name = "Empty";

var unk_color = "black";
var unk_symbol = "";
var unk_name = "Unk";

var wall_color = "grey";
var wall_symbol = "";
var wall_name = "Wall";

var player_color = "white";
var player_symbol = "You";
var player_name = "Player";

var prisoner_color = "orange";
var prisoner_symbol = "Man";
var prisoner_name = "Prisoner";

var monster_color = "blue";
var monster_symbol = "Mon";
var monster_name = "Monster";

var exit_color = "green";
var exit_symbol = "Exit";
var exit_name = "Exit";

var torch_name = "Torch";
var knife_name = "Knife";
var chest_name = "Chest";

// STARTING VARIABLES --------------------------------------------------
var random_messages = ["A rat skitters by.", "You feel a drop of water land on your neck.", "It's cold.", "You feel the damp wall of the cave.", "It's chilly."];
// name, color, symbol
var possible_loot = [["brown", "Ch", chest_name], ["yellow", "T", torch_name], ["#b8b0b0", "Kni", knife_name]];
var numberList = "0123456789";
var numString = "";
var spacePressed = 0;
var slashPressed = 0;
var numOfFollowing = 0;
var focused_menu = "inventory-container";
var blocked = 0;
var numberOfPrisoners = 1;
var numberOfMonsters = 1;
var torchTurns = 21;
var stunTurns = 4;
var message_interval_fun;
var object_interval_fun;
var old_max_loot = 12;
var max_loot = 12;
var wallGenerationLevel = 11;

var level = 1;

// COORDS FORMAT: [html object, x-coord, y-coord, display-color, display-symbol, collidable, name]
var coords = [];

// IMPORTANT UNMOVABLE COORDS FORMAT: [x-coord, y-coord, name]
var important_unmovable_coords = [];

// MOVABLE COORDS : [player, prisoner, monster]
var movable_coords = [[],[],[]];
// LOOT FORMAT: [x-coord, y-coord, display-color, display-symbol, name]
var loot = [];
// INVENTORY FORMAT: [name]
var inventory = [];
var old_inventory = [];

var changed_slots = [];

// FUNCTIONS -----------------------------------------------------------
// FUNCTIONS UTILIZING NO OUTSIDE FUNCTIONS
function findIndex(x, y) {
	var full;
	full = ((y+1) * (maze_dimensions_x));
	var index = (full - (maze_dimensions_x-x));
	return index;
}

function randomNum(min, max) {
	// to get random integer: Math.floor(Math.random() * (max-min+1)+ min)
	return Math.floor(Math.random() * (max-min+1)+ min);
}

function isThereAMovableOnThisBlock(x, y) {
	var lastMovable = 0;
	for (var i = 0; i < movable_coords.length; i++) {
		for (var f = 0; f < movable_coords[i].length; f++) {
			if (movable_coords[i][f][0] == x && movable_coords[i][f][1] == y) {
				lastMovable = [movable_coords[i][f][2], movable_coords[i][f][3]]; // color, symbol
			}
		}
	}
	return lastMovable;
}

function isThereLootOnThisBlock(x, y) {
	for (var i = 0; i < loot.length; i++) {
		if (loot[i][0] == x && loot[i][1] == y) {
			return [loot[i][2], loot[i][3], loot[i][4]]; // color, symbol, name
		}
	}
	return 0;
}

// FUNCTIONS UTILIZING MINIMAL OUTSIDE FUNCTIONS
function blankTile() {
	var tile_coords = [];
	var pass = 0;
	while (pass == 0) {
		var y = randomNum(0, maze_dimensions_y-1);
		var x = randomNum(0, maze_dimensions_x-1);
		if (coords[findIndex(x, y)][6] == empty_name && isThereAMovableOnThisBlock(x, y) == 0 && isThereLootOnThisBlock(x, y) == 0) {
			tile_coords.push(x);
			tile_coords.push(y);
			pass = 1;
		}
	}
	return tile_coords;
}

function changeInnerTile(x, y, style) {
	var index = findIndex(x, y);
	if (style == "wall") {
		coords[index][3] = wall_color;
		coords[index][4] = wall_symbol;
		coords[index][5] = 1;
		coords[index][6] = wall_name;
	} else if (style == "blank") {
		coords[index][3] = empty_color;
		coords[index][4] = empty_symbol;
		coords[index][5] = 0;
		coords[index][6] = empty_name;
	} else if (style == "exit") {
		coords[index][3] = exit_color;
		coords[index][4] = exit_symbol;
		coords[index][5] = 0;
		coords[index][6] = exit_name;
	}
}

function createMazeGrid() {
	var maze_display = document.getElementById('maze_display');
	empty(maze_display);
	maze_display.style.display = 'none';
	var gridSpot = createElem("DIV", 0, 0, maze_display, 0);
	var text = createElem("DIV", ["maze-text"], 0, gridSpot, 0);
	gridSpot.style.backgroundColor = "black";

	var x = 1;
	var y = 0;
	var iterNum = ((maze_dimensions_x)*(maze_dimensions_y))-1 //there is already a slot present (the first slot)
	for (var i = 0; i < iterNum; i++) {
		if (x==maze_dimensions_x) {
			y += 1;
			x = 0;
		}
		var gridClone = gridSpot.cloneNode(true);
		gridClone.id = String(i);
		gridSpot.parentNode.insertBefore(gridClone, gridSpot);
		gridSpot = gridClone;
		x += 1;
		console.log('created block');
	}
	document.getElementById("maze_display").style.removeProperty("display");
}

function blankMap() {
	var x = 0;
	var y = 0;
	var iterNum = ((maze_dimensions_x)*(maze_dimensions_y)) //there is already a slot present (the first slot)
	for (var i = 0; i < iterNum; i++) {
		if (x==maze_dimensions_x) {
			y += 1;
			x = 0;
		}
		console.log("Coords: ", x, ", ", y, " | index: ", (iterNum-1)-i);
		var spot = document.getElementById('maze_display').children[(iterNum-1)-i];
		//APPEND TO COORDS LIST
		coords[i] = [spot, x, y, unk_color, unk_symbol, 0, unk_name];
		if (spot.children[0]) {
			spot.children[0].innerHTML = unk_symbol;
		}
		spot.style.backgroundColor = unk_color;
		x += 1;
	}
}

function placePlayer() {
	// Player: [x-coord, y-coord, display-color, display-symbol, name, followed, torch, knife]
	// COORDS
	var player_y = randomNum(0, maze_dimensions_y-1);
	var player_x = randomNum(0, maze_dimensions_x-1);

	// PUSH INTO LIST
	movable_coords[0].push([player_x, player_y, player_color, player_symbol, player_name, 0, 0, 0]);
}

function farEnough(distance_player, distance_self, index1, index_self) {
	var good = 0;
	var tile;
	var limit = 10;
	while (good == 0) {
		if (limit == 0) {
			break;
		}
		limit -= 1
		tile = blankTile();
		var tile_player = Math.pow(Math.pow(movable_coords[0][0][0]-tile[0], 2)+Math.pow(movable_coords[0][0][1]-tile[1], 2), .5);
		if (tile_player >= distance_player) {
			good = 1;
			if (distance_self != 0) {
				for (var i = 0; i < movable_coords[index1].length; i++) { // gonna loop through all the other people in that movable_coords section, skipping themselves with index_self, and check distances
					if (i != index_self) {
						var object_player = Math.pow(Math.pow(movable_coords[0][0][0]-movable_coords[index1][i][0], 2)+Math.pow(movable_coords[0][0][1]-movable_coords[index1][i][1], 2), .5);
						if (object_player < distance_self) {
							good = 0;
						}
					}
				}
			}
		}
	}
	return tile;
}

function movableObjects() {
	// Prisoner: [x-coord, y-coord, display-color, display-symbol, name, following, torch, knife]
	// Monster: [x-coord, y-coord, display-color, display-symbol, name, stunned]
	//Prisoner
	for (var i = 0; i < numberOfPrisoners; i++) {
		var prisoner_coords = farEnough(10, 15, 1, i);
		movable_coords[1].push([prisoner_coords[0], prisoner_coords[1], prisoner_color, prisoner_symbol.concat("-", i), prisoner_name.concat("-", i), 0, 0]);
	}
	//Monster
	for (var i = 0; i < numberOfMonsters; i++) {
		var monster_coords = farEnough(6, 0);
		movable_coords[2].push([monster_coords[0], monster_coords[1], monster_color, monster_symbol, monster_name.concat("-", i), 0]);
	}

	var people_word = "prisoners";
	var monster_word = "monsters";
	if (numberOfPrisoners == 1) {
		people_word = "prisoner";
	}
	if (numberOfMonsters == 1) {
		monster_word = "monster";
	}
	// EDIT GOAL
	document.getElementById("goal-display").children[0].innerHTML = "Level ".concat(level);
	document.getElementById("goal-container").children[0].innerHTML = "Save ".concat(numberOfPrisoners, " ", people_word, " from ", numberOfMonsters, " ", monster_word, " and escape alive.");
}

function unmovableObjects() {
	var exit_coords = blankTile();
	changeInnerTile(exit_coords[0], exit_coords[1], "exit");
	important_unmovable_coords.push([exit_coords[0], exit_coords[1], exit_name]);
}

function refreshInventory() {
	var container = document.getElementById("inventory-container");
	var length = container.children.length; // define length separately because it will change as items are deleted
	for (var i = 0; i < length; i++) {
		container.children[0].remove();
	}
	for (var i = 0; i < inventory.length; i++) {
		post(String(i+1).concat(" - ").concat(inventory[i]), "inventory-container");
	}
}

function findByHTMLIndex(ind, parentId) {
	var parElem = document.getElementById(parentId);
	for (i = 0; i < parElem.children.length; i++) {
		if (parElem.children[i].dataset.index == ind) {
			return parElem.children[i];
		}
	}
	return 0;
}

function useItemEnd(index) {
	inventory.splice(index, 1);
	refreshInventory();
	endTurn(movable_coords[0][0][0], movable_coords[0][0][1]);
}

function createColorButton(button, border1, color1, border2, color2) {
	button.style.backgroundColor = color2;
	button.style.borderLeftColor = border2;
	button.addEventListener("mouseover", function(){
		if (color1 != 0) {
			this.style.backgroundColor = color1;
		}
		if (border1 != 0) {
			this.style.borderLeftColor = border1;
		}
	});
	button.addEventListener("mouseout", function(){
		if (color2 != 0) {
			this.style.backgroundColor = color2;
		}
		if (border2 != 0) {
			this.style.borderLeftColor = border2;
		}
	})
}

function removeEventListeners(elem) {
	var clone = elem.cloneNode(true);
	var elemParent = elem.parentElement;
	var elemSibling = elem.nextElementSibling;
	if (elemSibling) {
		elemParent.insertBefore(clone, elemSibling);
	} else {
		elemParent.appendChild(clone);
	}
	//elem.remove();
	return clone;
}

function createElem(type, classes, text, parent, id) {
	var elem = document.createElement(type);
	elem.style.display = 'none';
	for (var i = 0; i < classes.length; i++) {
		elem.classList.add(classes[i]);
	}
	if (text != 0) {
		elem.innerHTML = text;
	}
	if (parent != 0) {
		parent.appendChild(elem);
	}
	if (id != 0) {
		elem.id = id;
	}
	elem.style.removeProperty("display");
	return elem;
}

function personSelectOnClick(elem, ind1, ind2, ind3, amount) {
	elem.addEventListener("click", function() {
		if (elem.innerHTML != player_symbol) {
			post("You hand it to ".concat(movable_coords[ind1][ind2][3], "."), "messages-container");
		}
		movable_coords[ind1][ind2][ind3] += amount;
		useItemEnd();
		elem.parentNode.remove();
		focused_menu = "inventory-container";

	})
}

function useItem(index) {
	if (index < inventory.length) {
		if (movable_coords[0][0][5] == 0) {
			if (inventory[index] == torch_name) {
				movable_coords[0][0][6] += 20;
			} else if (inventory[index] == knife_name) {
				movable_coords[0][0][7] += 1;
			}
		} else {
			var reqElem = findByHTMLIndex(index, "inventory-container");
			var gridDesc = createElem("DIV", ["tool-select"], 0, reqElem, "select-person");
			var theUser = createElem("DIV", ["post"], player_symbol, gridDesc, 0);
			createColorButton(theUser, "#4d8080", "#416c6c", "#ff2900", "#ff6100");
			if (inventory[index] == torch_name) {
				personSelectOnClick(theUser, 0, 0, 6, torchTurns);
			} else if (inventory[index] == knife_name) {
				personSelectOnClick(theUser, 0, 0, 7, 1);
			}
			theUser.dataset.index = 0;
			for (var i = 1; i <= numOfFollowing; i++) {
				var indexOfFollower = findMovableIndexOfFollower(i);
				if (movable_coords[1][indexOfFollower][5] != 0) {
					var personOption = createElem("DIV", ["post"], movable_coords[1][indexOfFollower][3], gridDesc, 0);
					createColorButton(personOption, "#4d8080", "#416c6c", "#ff2900", "#ff6100");
					personOption.dataset.index = i;
					if (inventory[index] == torch_name) {
						personSelectOnClick(personOption, 1, indexOfFollower, 6, torchTurns);
					} else if (inventory[index] == knife_name) {
						personSelectOnClick(personOption, 1, indexOfFollower, 7, 1);
					}
				}
			}
			focused_menu = gridDesc.id;
		}



		if (inventory[index] == torch_name) {
			post("You light a torch. It burns bright.", "messages-container");
			
		} else if (inventory[index] == knife_name) {
			post("You take out your knife, ready to attack.", "messages-container");
		}
		if (movable_coords[0][0][5] == 0) {
			useItemEnd(index);
		}
	}
}

function changeTile(x, y) {
	if (!((x < 0 || x > maze_dimensions_x-1) || (y < 0 || y > maze_dimensions_y-1))) { // is it valid coords
		var index = findIndex(x, y);
		var slot = coords[index][0];
		var movableInfo = isThereAMovableOnThisBlock(x, y);
		var lootInfo = isThereLootOnThisBlock(x, y);
		if (movableInfo != 0) {
			slot.style.backgroundColor = movableInfo[0];
			if (slot.children[0]){
				slot.children[0].innerHTML = movableInfo[1];
			}
		} else if (lootInfo != 0) {
			slot.style.backgroundColor = lootInfo[0];
			if (slot.children[0]){
				slot.children[0].innerHTML = lootInfo[1];
			}
		} else {
			if (slot.children[0]){
				slot.children[0].innerHTML = coords[index][4];
			}
			slot.style.backgroundColor = coords[index][3];
		}
		changed_slots.push([x, y])
	}
}

function light(index1, index2) {
	var x = movable_coords[index1][index2][0];
	var y = movable_coords[index1][index2][1];
	changeTile(x, y, 1);
	changeTile(x+1, y);
	changeTile(x, y+1);
	changeTile(x-1, y);
	changeTile(x, y-1);
	if (movable_coords[index1][index2][6] > 0) {
		changeTile(x+1, y+1);
		changeTile(x-1, y+1);
		changeTile(x-1, y-1);
		changeTile(x+1, y-1);
		//outer rim
		changeTile(x+2, y);
		changeTile(x, y+2);
		changeTile(x-2, y);
		changeTile(x, y-2);
		movable_coords[index1][index2][6] -= 1;
		if (movable_coords[index1][index2][6] == 0) {
			post("Your torch goes out.", "messages-container");
		} else if (movable_coords[index1][index2][6] == 10) {
			post("Your light grows dimmer.", "messages-container");
		} else if (movable_coords[index1][index2][6] == 5) {
			post("The flame flickers.", "messages-container");
		}
	}
}

function revealMap() {
	var x = 0;
	var y = 0;
	var iterNum = ((maze_dimensions_x)*(maze_dimensions_y))
	for (var i = 0; i < iterNum; i++) {
		if (x==maze_dimensions_x) {
			y += 1;
			x = 0;
		}
		changeTile(x, y);
		x+=1;
	}
}

function refreshMap() {
	// Reset old tiles	
	document.getElementById("maze_display").style.display = 'none';
	if (changed_slots.length > 0) {
		var len = changed_slots.length;
		var iter = 0;
		while (iter < len) {
			var index = findIndex(changed_slots[0][0], changed_slots[0][1]);
			var elem = coords[index][0];
			elem.style.backgroundColor = unk_color;
			if (elem.children[0]) {
				elem.children[0].innerHTML = unk_symbol;
			}
			changed_slots.splice(0, 1); // will always delete the first element of the list (since the list shortens)
			iter += 1;
		}
	}
	var exit_index = findIndex(important_unmovable_coords[0][0], important_unmovable_coords[0][1]);
	coords[exit_index][0].style.backgroundColor = exit_color;
	coords[exit_index][0].children[0].innerHTML = exit_symbol;

		// Change new tiles
	if (movable_coords[0][0]) {
		for (var i = 0; i < 2; i++) {
			for (var p = 0; p < movable_coords[i].length; p++) {
				if (i == 1) {
					if (movable_coords[i][p][5] != 0) {
						light(i, p);
					}
				} else {
					light(i, p);
				}
			}
		}
		for (var f = 0; f < movable_coords[2].length; f++) {
			var mon_x = movable_coords[2][f][0];
			var mon_y = movable_coords[2][f][1];
			var mon_pl_distance = Math.pow(Math.pow(mon_x- movable_coords[0][0][0], 2)+Math.pow(mon_y-movable_coords[0][0][1], 2), .5);
			if (mon_pl_distance <= 2) {
				changeTile(mon_x, mon_y);
			}
		}
	
	/*if (movable_coords[0][0]) {
		var x = 0;
		var y = 0;
		var iterNum = ((maze_dimensions_x)*(maze_dimensions_y))
		for (var i = 0; i < iterNum; i++) {
			if (x==maze_dimensions_x) {
				y += 1;
				x = 0;
			}
			changeTile(x, y);
			x+=1;
		}
		
		changeTile(movable_coords[0][0][0], movable_coords[0][0][1], 1);*/
	}
	document.getElementById("maze_display").style.removeProperty('display');
}

function inventoryItemSelected(elem) {
	if (blocked == 0) {
		blocked = 1;
		var clone = removeEventListeners(elem);
		clone.style.borderLeftColor = "#ff2900";
		clone.style.backgroundColor = "#ff6100";
		elem.remove();
		useItem(clone.dataset.index);
	}
}

function post(text, place) {
	// place = messages-container or inventory-container
	var scrollDown = 1;
	var container = document.getElementById(place);
	if (container.scrollTop != container.scrollHeight - container.offsetHeight) {
		scrollDown = 0;
	}
	var gridSpot = createElem("DIV", ["post"], 0, container, 0);
	var spotWithinSpot = createElem("DIV", [], text, gridSpot, 0);

	if (place == "inventory-container") {
		index = 0;
		for (var i = 0; i < container.children.length; i++) {
			index = i;
		}
		gridSpot.dataset.index = index;
		createColorButton(gridSpot, "#ff2900", "#ff6100", "#4d8080", "#416c6c");
		gridSpot.addEventListener("click", function(){
			inventoryItemSelected(this);
		});
	}
	if (scrollDown == 1) {
		container.scrollTop = container.scrollHeight; // scroll to bottom
	}
}

function changeDirection(x, y) {
	var directionChange = Math.random();
	if (directionChange < .25) { // equal chance of turning in any direction
		x += 1;
	} else if (directionChange < .5) {
		x -= 1;
	} else if (directionChange < .75) {
		y += 1;
	} else if (directionChange < 1) {
		y -= 1;
	}
	return [x, y];
}

function findMovableIndexOfFollower(followRank) {
	for (var i = 0; i < movable_coords[1].length; i++) {
		if (movable_coords[1][i][5] == followRank) {
			return i;
		}
	}
	return -1;
}

function refreshFollowers() {
	numOfFollowing = 0;
	for (var i = 0; i < movable_coords[1].length; i++) {
		if (movable_coords[1][i][5] > 0) {
			numOfFollowing += 1;
			movable_coords[1][i][5] = numOfFollowing;
		}
	}
	if (numOfFollowing > 0) {
		movable_coords[0][0][5] = 1;
	} else {
		movable_coords[0][0][5] = 0;
	}
}

function firstPart() {
	var grid = document.getElementById("final-box");
	grid.classList.remove("final-anim");

	var gridClone = grid.cloneNode(true);
	gridClone.id = "koi";
	document.getElementById("main-body-grid").appendChild(gridClone);

	grid.style.display = 'none';
	gridClone.classList.add("leave");
	return gridClone;
}

function onRefresh() {
	var gridClone = firstPart();
	window.setTimeout(function() {
		gridClone.remove();
		asyncCall();
	}, 1000);
}

function reloadPageButton() {
	document.getElementById("new-game-button").style.display = 'none';
	asyncCall();
}

function onView() {
	var gridClone = firstPart();
	window.setTimeout(function() {
		gridClone.remove();
		revealMap();
		var newGameButton = document.getElementById("new-game-button");
		newGameButton.style.removeProperty("display");
	}, 1000);
}

function createSuccessFailureMessage(which) {
	var grid = document.getElementById("final-box");
	var title = grid.children[0];
	var newGame = grid.children[1];
	var refreshButton = document.getElementById("new-game-button").children[0];

	if (which == 1) {
		newGame.innerHTML = "Next level!";
		refreshButton.innerHTML = "Next level!";
		title.innerHTML = "Success!";
		old_inventory.length = 0;
		for (var i = 0; i < inventory.length; i++) {
			old_inventory.push(inventory[i]);
		}
		level += 1;
	} else {
		newGame.innerHTML = "Retry level";
		refreshButton.innerHTML = "Retry level";
		title.innerHTML = "Failure.";
		inventory.length = 0;
		for (var i = 0; i < old_inventory.length; i++) {
			inventory.push(old_inventory[i]);
		}
	}

	grid.style.removeProperty("display");
	grid.classList.add("final-anim");
}

function objectsMove(x_old, y_old) {
	x_new = movable_coords[0][0][0];
	y_new = movable_coords[0][0][1];
	// PLAYER
	if (x_new == important_unmovable_coords[0][0] && y_new == important_unmovable_coords[0][1]) { // if on exit
		if (movable_coords[1].length ==  0) {
			//post("Success!", "messages-container");
			movable_coords[0].splice(0, 1);

			// SUCCESS MESSAGE
			refreshMap();
			createSuccessFailureMessage(1);
			return;


			//revealMap();
		} else {
			post("You have ".concat(movable_coords[1].length, " people to save."), "messages-container");
		}
	}

	if (movable_coords[0][0]) {
		// PRISONER
		for (var f = numOfFollowing; f > 0; f--) {
			if (!(x_new == x_old && y_new == y_old)) {
				var indexOfFollower = findMovableIndexOfFollower(f);
				if (f == 1) {
					movable_coords[1][indexOfFollower][0] = x_old;
					movable_coords[1][indexOfFollower][1] = y_old;
				} else {
					var guy_ahead = findMovableIndexOfFollower(f-1);
					movable_coords[1][indexOfFollower][0] = movable_coords[1][guy_ahead][0];
					movable_coords[1][indexOfFollower][1] = movable_coords[1][guy_ahead][1];
				}
			}
		}
		for (var f = 0; f < movable_coords[1].length; f++) {
			if (movable_coords[1][f][0] == x_new && movable_coords[1][f][1] == y_new && movable_coords[1][f][5] == 0) {
				numOfFollowing += 1;
				movable_coords[1][f][5] = numOfFollowing;
				movable_coords[0][0][5] = 1;
				post("\"T-thank you.\"", "messages-container");
			}
			if (movable_coords[1][f][0] == important_unmovable_coords[0][0] && movable_coords[1][f][1] == important_unmovable_coords[0][1]) { // exit coords
				post(movable_coords[1][f][3].concat(" has successfully escaped!"), "messages-container");
				movable_coords[1].splice(f, 1);
				refreshFollowers();
			}
		}
		// MONSTER
		for (var f = 0; f < movable_coords[2].length; f++) {
			var mon_x = movable_coords[2][f][0];
			var mon_y = movable_coords[2][f][1];
			var og_mon_x = mon_x;
			var og_mon_y = mon_y;
			var mon_pl_distance = Math.pow(Math.pow(mon_x-x_new, 2)+Math.pow(mon_y-y_new, 2), .5);
			for (var go = 0; go < 10; go++) {
				mon_x = og_mon_x;
				mon_y = og_mon_y;
				var new_mon_coords = changeDirection(mon_x, mon_y);
				var mon_pl_distance_new = Math.pow(Math.pow(new_mon_coords[0]-x_new, 2)+Math.pow(new_mon_coords[1]-y_new, 2), .5);
				if (new_mon_coords[0] >= 0 && new_mon_coords[0] < maze_dimensions_x && new_mon_coords[1] >= 0 && new_mon_coords[1] < maze_dimensions_y) {
					var index = findIndex(new_mon_coords[0], new_mon_coords[1]);
					if (coords[index][5] != 1) {
						mon_x = new_mon_coords[0];
						mon_y = new_mon_coords[1];
						if (mon_pl_distance < 5) {
							if (mon_pl_distance_new < mon_pl_distance) {
								break;
							}
						} else {
							break;
						}
					} else if (coords[index][5] != 1 && mon_pl_distance < 5 && mon_pl_distance_new < mon_pl_distance) {
						go -= 1;
					}
				}
			}

			// KNIFE
			var knifePerson = 0;
			if (movable_coords[0][0][7] > 0) {
				knifePerson = movable_coords[0][0];
			} else {
				for (var p = 1; p <= numOfFollowing; p++) {
					var follower = findMovableIndexOfFollower(p);
					if (movable_coords[1][follower][7] > 0) {
						knifePerson = movable_coords[1][follower];
						break;
					}
				}
			}
			if (knifePerson != 0) {
				var knife_x = knifePerson[0];
				var knife_y = knifePerson[1];
				if ((mon_x == knife_x && mon_y == knife_y) || (mon_x == knife_x-1 && mon_y == knife_y) || (mon_x == knife_x && mon_y == knife_y-1) || (mon_x == knife_x+1 && mon_y == knife_y) || (mon_x == knife_x && mon_y == knife_y+1)) {
					movable_coords[2][f][5] = stunTurns; //stunned
					post("You hear a screech of pain. The monster trips and falls.", "messages-container");
				} else {
					post("The knife clangs against the stone wall and breaks.", "messages-container");
				}
			}
			if (movable_coords[2][f][5] == 0) {
				movable_coords[2][f][0] = mon_x;
				movable_coords[2][f][1] = mon_y;
				for (var u = 0; u < 2; u++) {
					for (var o = 0; o < movable_coords[u].length; o++) {
						if (movable_coords[u][o][0] == mon_x && movable_coords[u][o][1] == mon_y && movable_coords[u][o][7] == 0 && !(mon_x == important_unmovable_coords[0][0] && mon_y == important_unmovable_coords[0][1] && movable_coords[1].length == 0)) {
							if (u == 0) {
								post("You die.", "messages-container");
								refreshMap();
								movable_coords[0].splice(0, 1);
								createSuccessFailureMessage(0);
								return;
							} else if (u == 1 && movable_coords[u][o][5] > 0) {
								post(movable_coords[u][o][3].concat(" is injured."), "messages-container");
								movable_coords[u][o][5] = 0;
								refreshFollowers();
							}
						}
					}
				}
			} else {
				movable_coords[2][f][5] -= 1;
			}
		}
	}
}

function finalMessageButtonColors() {
	var grid = document.getElementById("final-box");
	var button1 = grid.children[1];
	var button2 = grid.children[2];
	var button3 = document.getElementById("new-game-button");
	var button4 = document.getElementById("controls-button");
	createColorButton(button1, 0, "#73a5a5", 0, "#5d9090");
	createColorButton(button2, 0, "#73a5a5", 0, "#5d9090");
	createColorButton(button3, 0, "#73a5a5", 0, "#5d9090");
	createColorButton(button4, 0, "#73a5a5", 0, "#5d9090");
}

function blankSpaces(x, y, extra, name) {
	if (name == null) {
		name = unk_name;
	}
	var blankSpaces = [];
	for (var f = -2; f <= 2; f++) {
		if (f%2 == 0) {
			var g = f/2;
			var index1 = findIndex(x+g, y);
			var index2 = findIndex(x, y+g);
			if (coords.length > index2 && index2 >= 0 && coords.length > index1 && index1 >= 0) {
				if (coords[index1][6] == name) {
					blankSpaces.push(index1);
				}
				if (coords[index2][6] == name) {
					blankSpaces.push(index2);
				}
			}
			if (extra == 1) {
				var index3 = findIndex(x+g, y+g); // if coords = [0, 0] | [1, 1] [-1, -1]
				var index4 = findIndex(x+g, y-g); // [1, -1] [-1, 1] all good
				if (coords.length > index3 && index3 >= 0 && coords.length > index4 && index4 >= 0) {
					if (coords[index3][6] == name) {
						blankSpaces.push(index3);
					}
					if (coords[index4][6] == name) {
						blankSpaces.push(index4);
					}
				}
			}
		}
	}
	return blankSpaces;
}

function createWalls() {
	var blank_tiles = [];
	var start_x = movable_coords[0][0][0];
	var start_y = movable_coords[0][0][1];
	changeInnerTile(start_x, start_y, "blank");
	
	function wallGeneration(starting_x, starting_y, numOfBlocks, repNum) {
		var og_st_x = starting_x;
		var og_st_y = starting_y;
		for (var i = 0; i < repNum; i++) {
			var current_x = starting_x;
			var current_y = starting_y;
			var start_current_distance_old = 0;
			for (var p = 0; p < numOfBlocks; p++) {
				var cont = 0;
				var limit = 0;
				while (cont == 0) {
					cont = 1;
					limit += 1;
					if (limit == 5 ) {
						break;
					}
					current_x = starting_x;
					current_y = starting_y;
					var new_coords = changeDirection(current_x, current_y);
					current_x = new_coords[0];
					current_y = new_coords[1];
					if ((current_x < 0 || current_x > maze_dimensions_x-1) || (current_y < 0 || current_y > maze_dimensions_y-1)) { //borders
						limit -= 1; // redoing this step if it goes out of the border
						cont = 0;
						continue;
					}
					var start_current_distance_new = Math.pow(Math.pow(starting_x - current_x, 2) + Math.pow(starting_y - current_y, 2), .5)
					if (start_current_distance_new < start_current_distance_old) { // makin sure distance is distanced
						cont = 0;
						continue;
					}

					if (blankSpaces(current_x, current_y, 0, empty_name).length > 1) {
						cont = 0;
						continue;
					}

					for (var r = 0; r < 2; r++) {
						var next_x = current_x;
						var next_y = current_y;
						var new_coords_2 = changeDirection(next_x, next_y);
						next_x = new_coords_2[0];
						next_y = new_coords_2[1];
						if (blankSpaces(current_x, current_y).length < 1 || blankSpaces(next_x, next_y).length < 3) {
							cont = 0;
						}
					}
				}
				start_current_distance_old = start_current_distance_new;
				starting_x = current_x;
				starting_y = current_y;
				changeInnerTile(current_x, current_y, "blank");
				var pushOrNot = 1;
				if (blank_tiles.length > 0) {
					for (var e = 0; e < blank_tiles.length; e++) {
						var tile_x = blank_tiles[e][0];
						var tile_y = blank_tiles[e][1];
						if (tile_x == current_x && tile_y == current_y) {
							pushOrNot = 0;
						}
					}
				}
				if (pushOrNot == 1) {
					blank_tiles.push([current_x, current_y]);
				}
			}
		}
		return [starting_x, starting_y];
	}
	var end_coords = wallGeneration(start_x, start_y, 2, 25);
	var limit = 10;
	while (blank_tiles.length < Math.ceil((maze_dimensions_x*maze_dimensions_y)*.3)) { // blank space minimum square limit
		if (limit == 0) {
			break;
		}
		limit -= 1;
		for (var g = 0; g < 3; g++) {
			end_coords = wallGeneration(end_coords[0], end_coords[1], 2, 27);
		}
		for (var g = 0; g < 3; g++) {
			end_coords = wallGeneration(end_coords[0], end_coords[1], 5, 12);
		}
	}
	var x = 0;
	var y = 0;
	var iterNum = ((maze_dimensions_x)*(maze_dimensions_y))
	for (var i = 0; i < iterNum; i++) {
		if (x == maze_dimensions_x) {
			y += 1;
			x = 0;
		}
		if (y > maze_dimensions_y-1) {
			break;
		}
		if (coords[findIndex(x, y)][6] != empty_name) {
			changeInnerTile(x, y, "wall");
		} else {
			if (blankSpaces(x, y, 1, empty_name).length > wallGenerationLevel) { //grow walls
				changeInnerTile(x, y, "wall");
			}
		}
		x+=1;
	}
}

function messages() {
	if (movable_coords[0][0]) {
		x = movable_coords[0][0][0];
		y = movable_coords[0][0][1];
		
		// DISTANCE MONSTER
		for (var f = 0; f < movable_coords[2].length; f++) {
			var mon_x = movable_coords[2][f][0];
			var mon_y = movable_coords[2][f][1];
			var mon_pl_distance = Math.pow(Math.pow(mon_x-x, 2)+Math.pow(mon_y-y, 2), .5);
			if (5 < mon_pl_distance && mon_pl_distance <= 10) {
				post("You hear scuffling noises.", "messages-container");
			} else if (2 < mon_pl_distance && mon_pl_distance <= 5) {
				post("You hear snarling.", "messages-container");
			} else if (mon_pl_distance <= 2) {
				post("You can feel the monster's breath.", "messages-container");
			}
		}
		// DISTANCE MAN
		for (var f = 0; f < movable_coords[1].length; f++) {
			if (movable_coords[1][f][5] == 0) {
				var pris_x = movable_coords[1][f][0];
				var pris_y = movable_coords[1][f][1];
				var pris_pl_distance = Math.pow(Math.pow(pris_x-x, 2)+Math.pow(pris_y-y, 2), .5);
				if (5 < pris_pl_distance && pris_pl_distance <= 7) {
					post("You hear distant moans.", "messages-container");
				} else if (pris_pl_distance <= 2) {
					post("\"Who's there?\"", "messages-container");
				}
			}
		}
		if (Math.random() > .5) {
			post(random_messages[randomNum(0, random_messages.length-1)], "messages-container");
		}
	} else {
		clearInterval(message_interval_fun);
		message_interval_fun = null;
	}
}

function dropObject() {
	if (movable_coords[0][0]) {
		if (loot.length < max_loot) {
			if (Math.random() > .3) {
				var object = possible_loot[1];
				var num = Math.random();
				if (num < .1) {
					object = possible_loot[0];
				} else if (num < .55) {
					object = possible_loot[1];
				} else if (num < 1) {
					object = possible_loot[2];
				}
				var spot = blankTile();
				loot.push([spot[0], spot[1], object[0], object[1], object[2]]);
			}
		}
	} else {
		clearInterval(object_interval_fun);
		object_interval_fun = null;
	}
}

function pickUpObject() {
	if (movable_coords[0][0]) {
		var x = movable_coords[0][0][0];
		var y = movable_coords[0][0][1];
		var lootInfo = isThereLootOnThisBlock(x, y);
		function acquisition(itemInfo, chest) {
			for (var i = 0; i < loot.length; i++) {
				if (loot[i][0] == x && loot[i][1] == y) {
					if (loot[i][4] == itemInfo[2] || (chest == 1 && loot[i][4] == chest_name)) {
						loot.splice(i, 1);
						break;
					}
				}
			}
			inventory.push(itemInfo[2]);
			post("You acquired a ".concat(itemInfo[2]).concat("!"), "messages-container");
			refreshInventory();
		}
		if (lootInfo != 0) {
			if (lootInfo[2] == chest_name) {
				post("You opened a chest!", "messages-container");
				var item1 = possible_loot[randomNum(1, possible_loot.length-1)];
				var item2 = possible_loot[randomNum(1, possible_loot.length-1)];
				acquisition(item1, 1);
				acquisition(item2, 1);
			} else {
				acquisition(lootInfo);
			}
		}
	}
}

function endTurn(old_x, old_y) {
	objectsMove(old_x, old_y);
	for (var u = 0; u < 2; u++) {
		for (var o = 0; o < movable_coords[u].length; o++) {
			movable_coords[u][o][7] = 0;
		}
	}
	pickUpObject();
	refreshMap();
	blocked = 0;
}

function empty(elem){
	var child = elem.lastElementChild;  
    while (child) { 
        elem.removeChild(child); 
        child = elem.lastElementChild; 
    }
}

function clearEverything() {
	var maze_grid = document.getElementById("maze_display");
	var messages_grid = document.getElementById("messages-container");
	var inventory_grid = document.getElementById("inventory-container");
	coords.length = 0;
	loot.length = 0;
	changed_slots.length = 0;
	important_unmovable_coords.length = 0;
	empty(document.getElementById("messages-container"));
	refreshInventory();
	for (var i = 0; i < movable_coords.length; i++) {
		movable_coords[i].length = 0;
	}
	numOfFollowing = 0;
}

function displayInfo(button) {
	var screen = document.getElementById("controls-screen");
	if (screen.style.display == 'none') {
		screen.style.removeProperty("display");
	} else {
		screen.style.display = 'none';
	}
}

function keyDown(event) {
	if (movable_coords[0][0]) {
		var validKey = 0;
		var old_x = movable_coords[0][0][0];
		var old_y = movable_coords[0][0][1];
		if (event.key == "w" || event.key == "W") {
			movable_coords[0][0][1] += 1;
			validKey = 1;
		} else if (event.key == "a" || event.key == "A") {
			movable_coords[0][0][0] += 1;
			validKey = 1;
		} else if (event.key == "s" || event.key == "S") {
			movable_coords[0][0][1] -= 1;
			validKey = 1;
		} else if (event.key == "d" || event.key == "D") {
			movable_coords[0][0][0] -= 1;
			validKey = 1;
		} else if (event.keyCode == 32) {
			spacePressed = 1;
		} else if (event.code == "Backslash") {
			console.log("Pressed slash");
			slashPressed = 1;
		} else {
			for (var i = 0; i < numberList.length; i++) {
				if (event.key == numberList[i]) {
					numString = numString.concat(numberList[i]);
					if (spacePressed == 0 && slashPressed == 0) {
						if (focused_menu == "inventory-container") {
							var elem = findByHTMLIndex(parseInt(numString, 10)-1, focused_menu);
							if (elem != 0) {
								inventoryItemSelected(elem);
							}
						} else if (focused_menu == "select-person") {
							var elem = findByHTMLIndex(parseInt(numString, 10)-1, focused_menu)
							if (elem != 0) {
								elem.click();
							}
						}
						numString = "";
					}
					break;
				}
			}
		}
		if (blocked == 0 && movable_coords[0][0]) {
			blocked = 1;
			var x = movable_coords[0][0][0];
			var y = movable_coords[0][0][1];
			var faind = findIndex(x, y);
			if (((x < 0 || x > maze_dimensions_x-1) || (y < 0 || y > maze_dimensions_y-1))) {
				movable_coords[0][0][0] = old_x;
				movable_coords[0][0][1] = old_y;
			}
			if (faind >= 0 && faind < coords.length) {
				if (coords[faind][5] == 1) {
					movable_coords[0][0][0] = old_x;
					movable_coords[0][0][1] = old_y;
				}
			}
			if (validKey == 1) {
				endTurn(old_x, old_y);
			}
			blocked = 0;
		} else {
			if (movable_coords[0][0]) {
				movable_coords[0][0][0] = old_x;
				movable_coords[0][0][1] = old_y;
			}
		}
	}
}

function keyUp(event) {
	if (movable_coords[0][0]) {
		console.log("key up");
		console.log("Numbstring: ", numString);
		if (event.keyCode == 32) {
			if (numString != "") {
				if (focused_menu == "inventory-container") {
					var elem = findByHTMLIndex(parseInt(numString, 10)-1, focused_menu);
					if (elem != 0) {
						inventoryItemSelected(elem);
					}
				} else if (focused_menu == "select-person") {
					var elem = findByHTMLIndex(parseInt(numString, 10)-1, focused_menu)
					if (elem != 0) {
						elem.click();
					}
				}
			}
			numString = "";
			spacePressed = 0;
		} else if (event.code == "Backslash") {
			if (numString != "") {
				var newLevel = parseInt(numString, 10);
				level = newLevel;
				asyncCall();
			}
			numString = "";
			slashPressed = 0;
		}
	}
}

async function levelData() {
	var maze_display = document.getElementById('maze_display');
	numberOfMonsters = Math.ceil(level/2);
	numberOfPrisoners = Math.floor(level/2) + 1;
	max_loot = old_max_loot-level;
	if (max_loot <= 0) {
		max_loot = 1;
	}
	if (level >= 1 && level < 3) {
		maze_dimensions_x = or_maze_dimensions_x;
		maze_dimensions_y = or_maze_dimensions_y;
	} else if (level >= 3 && level < 5) {
		maze_dimensions_x = or_maze_dimensions_x+1;
		maze_dimensions_y = or_maze_dimensions_y+1;
	} else if (level >= 5) {
		maze_dimensions_x = or_maze_dimensions_x+4;
		maze_dimensions_y = or_maze_dimensions_y+4;
	}
	if ((maze_dimensions_y*maze_dimensions_x) != maze_display.children.length) {
		maze_display.style.gridTemplateColumns = "1fr ".repeat(maze_dimensions_x);
		maze_display.style.gridTemplateRows = "1fr ".repeat(maze_dimensions_y);
		await createMazeGrid();
	}
}

async function asyncCall() {
	window.removeEventListener("keydown", keyDown, true);
	window.removeEventListener("keyup", keyUp, true);
	await levelData();
	await clearEverything();
	//await printInfo();
	await blankMap();
	await placePlayer();
	await createWalls();
	await unmovableObjects();
	await movableObjects();
	await refreshMap();
	message_interval_fun = window.setInterval(messages, 5000);
	object_interval_fun = window.setInterval(dropObject, 3000);
	
	window.addEventListener("keydown", keyDown, true);
	window.addEventListener("keyup", keyUp, true);
}

finalMessageButtonColors();
createMazeGrid();
asyncCall();