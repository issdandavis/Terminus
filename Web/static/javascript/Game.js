var state = new GameState();
//read cookie if one exists
var current_room = state.getCurrentRoom();
// var current_room = KernelFiles;
var man_pages = {"cd": "The old man's voice echoes in your head as if from a great distance: \n"+
"(Choose Destination) Use \"cd\" to move about the world. \n" +
"Command Input: cd LOCATION \n" +
 "Rememberrrrrr...", 
"mv": "The old man's voice echoes in your head as if from a great distance: \n" + 
"(MoVe). \n Use \"mv\" to move an object to a new location. \n Command Input:" + 
"mv OBJECT NEWLOCATION \n" + 
"Rememberrrrrr...",
"ls": "The old man's voice echoes in your head as if from a great distance: \n" + 
"(Look at your Surroundings). \n Use \"ls\" to look at what’s in a certain location. " +
"Either your current location or (rarely) you may have look into a location to see "+
"what's in it. \n" + 
" Command Input: \n" + 
"ls          (for current location) \n" + 
"-OR- \n" + 
"ls LOCATION     (for locations you that you cannot \"cd\" into)\n" + 
"Rememberrrrrr...", 
"less": "The old man's voice echoes in your head as if from a great distance: \n"+
"(Look at, Examine, or Speak to Something). \nUse \"less\" to look at what’s in a "+
"certain location. Either your current location or (rarely) you may have look into a "+
"location to see what is in it. \n" + 
"Command Input: less ITEM\n" +
"Rememberrrrrr...", 
"man": "I'm the old man dangit! You can't try to get more information about me. Here are all the commands you can man: cd, ls, rm, mv, exit, help, man, touch, grep, pwd.", 
"help": "Type \"man COMMAND\" if you forget how to use a command.", 
"exit": "The old man's voice echoes in your head as if from a great distance:\n" + 
"(exit) \n" + 
"Use \"exit\" to exit the game permanently. \n" + 
"Command Input: \n" + 
"exit \n" + 
"Rememberrrrrr...", 
"cp": "The old man's voice echoes in your head as if from a great distance:\n" +
"(CoPy)\n" + 
"Use \"cp\" to duplicate an item. \n" + 
"Command Input:\n" + 
"cp ITEM NEWNAME \n" +
"Rememberrrrrr...", 
"pwd": "The old man's voice echoes in your head as if from a great distance: \n" + 
"(Print Where i Do stuff) \n" +
"To remind yourself where you currently are.\n" + 
"Command Input: \n" + 
"pwd \n" + 
"Rememberrrrrr...",
"grep": "The old man's voice echoes in your head as if from a great distance:\n" +
"(grep) \n" + 
"Use \"grep\" to command your minion to help search through text for you.\n" + 
"Command Input: \n" + 
"grep WORDTOSEARCH PLACETOSEARCH \n" +
"Rememberrrrrr...",
"touch": "The old man's voice echoes in your head as if from a great distance:\n"+
"(Touch) gives you the artisan's touch to create new objects.\n" +
"Use \"touch\" to create new objects in the world.\n" +
"Command Input:\n" + 
"touch OBJECT \n" + 
"Rememberrrrrr...", 
"tellme": "The old man's voice echoes in your head as if from a great distance:\n"+
"(tellme combo) tells you the combination for the AthenaCluster rooms at MIT.\n"+
"Command Input:\n"+
"tellme combo\n"+
"Rememberrrrrr...",
"solve": "Use solve to answer an enemy problem in MathArena.\n" +
"Command Input:\n" +
"solve EnemyName answer\n" +
"Example: solve LinearEquationEnemy 4"}

var command_aliases = {
    "look": "ls",
    "read": "less",
    "inspect": "less",
    "examine": "less",
    "talk": "less",
    "speak": "less",
    "where": "pwd",
    "go": "cd",
    "move": "cd",
    "enter": "cd"
};

var global_help_commands = ["commands", "hint", "tutorial", "guild", "guilds", "bank", "house", "math"];

var math_enemy_answers = {
    "LinearEquationEnemy": "4",
    "BinaryMaskEnemy": "1000",
    "HexCarryEnemy": "0x10",
    "ProofGateEnemy": "B"
};

var tutorial_steps = [
    {id: "survey", command: "ls", text: "Survey the room with ls."},
    {id: "letter", command: "less WelcomeLetter", text: "Read the WelcomeLetter."},
    {id: "forest", command: "cd WesternForest", text: "Travel to WesternForest."},
    {id: "sign", command: "less Sign", text: "Read signs and people with less Item."},
    {id: "academy", command: "cd SpellCastingAcademy", text: "Join the Guild path at the academy."},
    {id: "district", command: "cd ~/GuildDistrict", text: "Enter the code guild district."},
    {id: "directory", command: "less GuildDirectory", text: "Read the language guild directory."},
    {id: "binary", command: "cd BinaryGuild", text: "Visit an advanced representation guild."},
    {id: "mathguild", command: "cd ../AdvancedMathematicsGuild", text: "Enter the advanced mathematics guild."},
    {id: "arena", command: "cd MathArena", text: "Treat math problems as enemies."},
    {id: "solve", command: "solve LinearEquationEnemy 4", text: "Defeat the first math enemy."},
    {id: "lessons", command: "cd ~/WesternForest/SpellCastingAcademy/Lessons", text: "Take Lessons to learn mv."},
    {id: "market", command: "reach Marketplace", text: "Later: reach Marketplace and read mkdirSpell for the guild office build lane."},
    {id: "bank", command: "touch AccountLedger", text: "Bank account model: create an AccountLedger where touch is available."},
    {id: "house", command: "mkdir House", text: "Housing path: when mkdir is learned, create House at Clearing."}
];

var completed_tutorial_steps = {};

function normalizeName(name){
    if (!name){
        return "";
    }
    return name.toString().replace(/\s+/g, "").toLowerCase();
}

function roomNames(room){
    var names = [];
    for (var i = 0; i < room.children.length; i++){
        names.push(room.children[i].room_name);
    }
    return names;
}

function itemNames(room){
    var names = [];
    for (var i = 0; i < room.items.length; i++){
        names.push(room.items[i].itemname);
    }
    return names;
}

function levenshtein(a, b){
    a = normalizeName(a);
    b = normalizeName(b);
    var matrix = [];
    for (var i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }
    for (var j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }
    for (i = 1; i <= b.length; i++){
        for (j = 1; j <= a.length; j++){
            if (b.charAt(i - 1) === a.charAt(j - 1)){
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function bestNameMatch(input, names){
    var requested = normalizeName(input);
    if (!requested){
        return null;
    }
    for (var i = 0; i < names.length; i++){
        if (normalizeName(names[i]) === requested){
            return names[i];
        }
    }
    for (i = 0; i < names.length; i++){
        var candidate = normalizeName(names[i]);
        if (candidate.indexOf(requested) === 0 || requested.indexOf(candidate) === 0){
            return names[i];
        }
    }
    var best = null;
    var bestScore = 99;
    for (i = 0; i < names.length; i++){
        var score = levenshtein(input, names[i]);
        if (score < bestScore){
            bestScore = score;
            best = names[i];
        }
    }
    if (bestScore <= 2){
        return best;
    }
    return null;
}

function parseInput(input){
    input = $.trim(input || "");
    var split = input.split(/\s+/);
    var command = (split[0] || "").toString();
    var args = split.slice(1);

    if (command === "back"){
        command = "cd";
        args = [".."];
    }
    if (command_aliases[command]){
        command = command_aliases[command];
    }
    if ((command === "less" || command === "read") && args[0] === "ITEM"){
        args.shift();
    }
    if (command === "less" && args.length > 1){
        var last_item_match = bestNameMatch(args[args.length - 1], itemNames(current_room));
        if (last_item_match){
            args = [last_item_match];
        }
    }
    if ((command === "cd" || command === "less" || command === "ls") && args.length > 1 && args[0].indexOf("/") < 0){
        args = [args.join("")];
    }
    if ((command === "cd" || command === "ls") && args.length === 1 && args[0] !== ".." && args[0] !== "~" && args[0] !== "."){
        var room_match = bestNameMatch(args[0], roomNames(current_room));
        if (room_match){
            args[0] = room_match;
        }
    }
    if (command === "less" && args.length === 1){
        var item_match = bestNameMatch(args[0], itemNames(current_room));
        if (item_match){
            args[0] = item_match;
        }
    }
    return {command: command, args: args};
}

function currentHint(){
    if (current_room.room_name === "Home"){
        return "Try ls, then cd GuildDistrict for language guilds or cd WesternForest for the original path.";
    }
    if (current_room.room_name === "GuildDistrict"){
        return "Read less GuildDirectory, then enter a guild like cd PythonGuild, cd BinaryGuild, or cd AdvancedMathematicsGuild.";
    }
    if (current_room.room_name === "PythonGuild"){
        return "Use less Board and less StarterContract. This guild maps intent to readable executable functions.";
    }
    if (current_room.room_name === "JavaScriptGuild"){
        return "Use less Board and less EventLoopDiagram. This guild maps commands to events and interface updates.";
    }
    if (current_room.room_name === "RustGuild"){
        return "Use less Board. This guild trains ownership, boundaries, and collision control.";
    }
    if (current_room.room_name === "HaskellGuild"){
        return "Use less Board. This guild trains pure transformations and type-shaped reasoning.";
    }
    if (current_room.room_name === "BinaryGuild"){
        return "Use less Board and less BitMaskTrial. Binary problems become exact bit enemies.";
    }
    if (current_room.room_name === "HexadecimalGuild"){
        return "Use less Board and less ByteTrial. Hex problems become compact byte enemies.";
    }
    if (current_room.room_name === "AdvancedMathematicsGuild"){
        return "Use less Board, then cd MathArena to solve enemies.";
    }
    if (current_room.room_name === "MathArena"){
        return "Use less LinearEquationEnemy, then solve LinearEquationEnemy 4. Try BinaryMaskEnemy, HexCarryEnemy, and ProofGateEnemy too.";
    }
    if (current_room.room_name === "WesternForest"){
        return "Use less Sign, then cd SpellCastingAcademy.";
    }
    if (current_room.room_name === "SpellCastingAcademy"){
        return "Use ls, less HurryingStudent, then cd Lessons or cd PracticeRoom.";
    }
    if (current_room.room_name === "Lessons"){
        return "Use less Professor to learn mv, then use cd .. when done.";
    }
    if (current_room.room_name === "ArtisanShop"){
        return "Guild office practice: use touch Gear and cp Gear gear1 through gear5.";
    }
    if (current_room.room_name === "Farm"){
        return "Bank practice: use cp EarOfCorn AnotherEarOfCorn to learn safe duplication.";
    }
    if (current_room.room_name === "Clearing"){
        return "Settlement practice: use mkdir House to build a house.";
    }
    return "Use ls to list what is here, less Item to inspect, and cd Place to move.";
}

function helpText(command){
    if (command === "commands"){
        return "Command tutorial:\n" +
            "ls                  list locations and items here\n" +
            "less Item           read, inspect, or talk to an item\n" +
            "cd Location         move into a listed location\n" +
            "cd ..               go back one room\n" +
            "cd ~                return Home\n" +
            "pwd                 print where you are\n" +
            "man Command         show the old command manual\n" +
            "guilds              list language and advanced guilds\n" +
            "math                explain math enemies\n" +
            "solve Enemy answer  answer a MathArena enemy\n" +
            "hint                get the next practical action\n\n" +
            "Friendly aliases also work: look=ls, read=less, go=cd, back=cd ..";
    }
    if (command === "tutorial" || command === "guild"){
        return "Guild tutorial path:\n" +
            "1. ls\n" +
            "2. cd GuildDistrict\n" +
            "3. less GuildDirectory\n" +
            "4. cd PythonGuild or cd JavaScriptGuild for normal code guilds\n" +
            "5. cd BinaryGuild or cd HexadecimalGuild for representation guilds\n" +
            "6. cd AdvancedMathematicsGuild, then cd MathArena\n" +
            "7. less LinearEquationEnemy, then solve LinearEquationEnemy 4\n\n" +
            "This turns code languages into guilds and math problems into solvable enemies.";
    }
    if (command === "guilds"){
        return "Available guilds:\n" +
            "PythonGuild - readable automation and scripts\n" +
            "JavaScriptGuild - browser tools and event loops\n" +
            "RustGuild - ownership and compiled systems\n" +
            "HaskellGuild - types and pure transforms\n" +
            "BinaryGuild - bits, masks, and exact representation\n" +
            "HexadecimalGuild - bytes and compact machine notation\n" +
            "AdvancedMathematicsGuild - equations, proofs, and MathArena enemies\n\n" +
            "From Home, use cd GuildDistrict. From there, use cd GuildName.";
    }
    if (command === "bank"){
        return "Guild bank model:\n" +
            "Use inventory commands as account operations. Learn touch at ArtisanShop, then create AccountLedger with touch AccountLedger. Learn cp at Farm, then copy approved resources instead of moving originals. The sidebar will keep this path visible while you play.";
    }
    if (command === "house"){
        return "Housing path:\n" +
            "Reach Marketplace, read mkdirSpell, then use mkdir House when the command becomes available. At Clearing, mkdir House settles the local housing objective.";
    }
    if (command === "math"){
        return "Math enemies:\n" +
            "A problem is represented as an enemy with givens, a target, allowed moves, and a win condition.\n" +
            "Use less EnemyName to inspect it.\n" +
            "Use solve EnemyName answer to defeat it.\n" +
            "Start with cd GuildDistrict, cd AdvancedMathematicsGuild, cd MathArena.";
    }
    return currentHint();
}

function solveEnemy(args){
    if (args.length < 2){
        return "Use solve EnemyName answer. Example: solve LinearEquationEnemy 4";
    }
    if (current_room.room_name !== "MathArena"){
        return "Math enemies are fought in MathArena. Use cd GuildDistrict, cd AdvancedMathematicsGuild, then cd MathArena.";
    }
    var enemy = bestNameMatch(args[0], Object.keys(math_enemy_answers));
    if (!enemy){
        return "No math enemy named " + args[0] + " is active here.";
    }
    var answer = args.slice(1).join("").toString();
    var expected = math_enemy_answers[enemy];
    if (answer.toLowerCase() === expected.toLowerCase()){
        completed_tutorial_steps.solve = true;
        return enemy + " defeated. Answer " + expected + " matched the win condition.";
    }
    return enemy + " resisted. Expected a different answer. Use less " + enemy + " to inspect the givens and allowed moves.";
}

function updateTutorialProgress(input, parsed){
    var normalized = $.trim(input || "").toLowerCase();
    if (parsed.command === "ls"){
        completed_tutorial_steps.survey = true;
    }
    if (parsed.command === "less" && parsed.args[0] === "WelcomeLetter"){
        completed_tutorial_steps.letter = true;
    }
    if (parsed.command === "cd" && current_room.room_name === "WesternForest"){
        completed_tutorial_steps.forest = true;
    }
    if (parsed.command === "less" && parsed.args[0] === "Sign"){
        completed_tutorial_steps.sign = true;
    }
    if (parsed.command === "cd" && current_room.room_name === "SpellCastingAcademy"){
        completed_tutorial_steps.academy = true;
    }
    if (parsed.command === "cd" && current_room.room_name === "GuildDistrict"){
        completed_tutorial_steps.district = true;
    }
    if (parsed.command === "less" && parsed.args[0] === "GuildDirectory"){
        completed_tutorial_steps.directory = true;
    }
    if (parsed.command === "cd" && current_room.room_name === "BinaryGuild"){
        completed_tutorial_steps.binary = true;
    }
    if (parsed.command === "cd" && current_room.room_name === "AdvancedMathematicsGuild"){
        completed_tutorial_steps.mathguild = true;
    }
    if (parsed.command === "cd" && current_room.room_name === "MathArena"){
        completed_tutorial_steps.arena = true;
    }
    if (parsed.command === "cd" && current_room.room_name === "Lessons"){
        completed_tutorial_steps.lessons = true;
    }
    if (normalized.indexOf("accountledger") > -1){
        completed_tutorial_steps.bank = true;
    }
    if (parsed.command === "mkdir" && parsed.args[0] === "House"){
        completed_tutorial_steps.house = true;
    }
}

function nextTutorialStep(){
    for (var i = 0; i < tutorial_steps.length; i++){
        if (!completed_tutorial_steps[tutorial_steps[i].id]){
            return tutorial_steps[i];
        }
    }
    return {command: "explore", text: "Tutorial complete. Keep exploring."};
}

function updateAssistant(){
    $("#assistant-location").text("Room: " + current_room.room_name);
    var next = nextTutorialStep();
    $("#assistant-next").html("Next: <code>" + next.command + "</code>");

    var locations = $("#assistant-locations");
    locations.empty();
    var children = roomNames(current_room);
    if (children.length === 0){
        locations.append("<li>None listed</li>");
    }
    for (var i = 0; i < children.length; i++){
        locations.append("<li><code>cd " + children[i] + "</code></li>");
    }

    var items = $("#assistant-items");
    items.empty();
    var names = itemNames(current_room);
    if (names.length === 0){
        items.append("<li>None listed</li>");
    }
    for (i = 0; i < names.length; i++){
        items.append("<li><code>less " + names[i] + "</code></li>");
    }

    var steps = $("#tutorial-steps");
    steps.empty();
    for (i = 0; i < tutorial_steps.length; i++){
        var step = tutorial_steps[i];
        var class_name = completed_tutorial_steps[step.id] ? "done" : (step.id === next.id ? "current" : "");
        steps.append("<li class='" + class_name + "'><code>" + step.command + "</code> " + step.text + "</li>");
    }
}

function commandGuidance(command, args){
    if (command === "cd" && args.length > 0 && bestNameMatch(args.join(""), itemNames(current_room))){
        return args.join("") + " is an item. Use less " + bestNameMatch(args.join(""), itemNames(current_room)) + " to inspect it.";
    }
    if (command === "ls" && args.length > 0 && bestNameMatch(args.join(""), itemNames(current_room))){
        return "ls lists rooms. To inspect " + bestNameMatch(args.join(""), itemNames(current_room)) + ", use less " + bestNameMatch(args.join(""), itemNames(current_room)) + ".";
    }
    if (command === "less" && args.length > 0 && bestNameMatch(args.join(""), roomNames(current_room))){
        return args.join("") + " is a location. Use cd " + bestNameMatch(args.join(""), roomNames(current_room)) + " to go there.";
    }
    return null;
}

$(document).ready(function() {
    $('#term').terminal(function(input, term) {
        var parsed = parseInput(input);
        var command = parsed.command;
        var args = parsed.args;
        var exec = true;
        if (command === ""){
            return;
        }
        if (global_help_commands.indexOf(command) > -1){
            term.echo(helpText(command));
            updateAssistant();
            return;
        }
        if (command === "solve" || command === "attack"){
            term.echo(solveEnemy(args));
            updateTutorialProgress(input, parsed);
            updateAssistant();
            return;
        }
        var guidance = commandGuidance(command, args);
        if (guidance){
            term.echo(guidance);
            updateAssistant();
            return;
        }
        if( current_room.commands.indexOf(command) > -1 ){ //Could use current_room.hasOwnProperty(command)
            var prev_room_to_test = current_room;
            if (args.length > 0 && args[0].indexOf("/") > 0){
                var rooms_in_order = args[0].split("/");
                var cur_room_to_test = current_room;
                for (var i = 0; i < rooms_in_order.length; i++){
                    prev_room_to_test = cur_room_to_test;
                    var room_to_cd = rooms_in_order[i];
                    if (i > 0 && rooms_in_order[i-1] === "~"){
                        cur_room_to_test = Home.can_cd(room_to_cd)
                    } else if (room_to_cd === "~"){
                        cur_room_to_test = Home;
                    } else {
                        cur_room_to_test = cur_room_to_test.can_cd(room_to_cd);
                    }
                    if ((command === "cd" || command === "ls") && cur_room_to_test === false){
                        term.echo("That is not reachable from here.");
                        exec = false;
                    }
                }
                args[0] = cur_room_to_test.room_name;
            }
            if (exec){
                var text_to_display = prev_room_to_test[command](args);
                if (text_to_display){
                    term.echo(text_to_display);
                }
                if (command in current_room.cmd_text){
                    term.echo(current_room.cmd_text[command]);
                }
                updateTutorialProgress(input, parsed);
            }
        }
        else{
            term.echo("Command '"+command+"' is not available in "+current_room.room_name+". Type commands for the tutorial or hint for the next useful action.");
        }
        updateAssistant();
    }, { history: true,                     // Keep user's history of commands
        prompt: '>',                        // Text that prefixes terminal entries
        name: 'terminus_terminal',          // Name of terminal
                                            // Signiture to include at top of terminal
        greetings:"Welcome! If you are new to the game, here are some tips: \n\n" +
		"Look at your surroundings with the command \"ls\". \n" +
		"Move to a new location with the command \"cd LOCATION\" \n" +
		"You can backtrack with the command \"cd ..\". \n" +
		"Interact with things in the world with the command \"less ITEM\" \n" +
        "You can also type \"commands\", \"hint\", \"guilds\", \"math\", \"bank\", or \"house\".\n\n" +
        "If you forget where you are, type \"pwd\" \n\n" + 
		"Go ahead, explore. Do ls as your first command. The Guild Clerk sidebar will help.\n",
        exit: false,                        // Disable 'exit' command
        clear: true,                       // Disable 'clear' command
        });
    
    // Clear history on page reload
    $("#term").terminal().history().clear();
    //Give term focus (Fixes weird initial draw issue)
    $("#term").click();
    updateAssistant();
    //Tab Completion FOR LAST ARGUMENT
    $(window).keyup(function(event){
        if(event.keyCode == 9){
            var command = $("#term").terminal().get_command().replace(/\s+$/,"");
            var split_command = command.split(" ");
            var first_arg = split_command[0]
            var last_arg = split_command.pop();
            //Start in a room, try to move through path, and if we get to the end
            // check whether a room/item could complete our trip
            
            //Get starting room
            var search_room;
            if(last_arg.substring(0,1) == "~"){
                search_room = jQuery.extend(true, {}, Home);
            }
            else{
                search_room = jQuery.extend(true, {}, current_room);
            }
            //Iterate through each room
            var path_rooms = last_arg.split("/");
            var new_room;
            var incomplete_room;
            var substring_matches = [];
            for (room_num=0;room_num<path_rooms.length;room_num++)
            {
                new_room = search_room.can_cd(path_rooms[room_num]);
                if(new_room){
                    search_room = new_room;
                }
                else{
                    //We've made it to the final room,
                    // so we should look for things to complete our journey
                    if(room_num == path_rooms.length-1){
                        //IF cd, ls, cp, mv, less
                        //Compare to this room's children
                        if(first_arg == "cd" ||
                            first_arg == "ls" ||
                            first_arg == "mv")
                        {
                            for(child_num = 0; child_num<search_room.children.length; child_num++){
                                if(search_room.children[child_num].room_name.match("^"+path_rooms[room_num])){
                                    substring_matches.push(search_room.children[child_num].room_name);
                                }
                            }
                        }
                        //IF cp, mv, less, grep, touch
                        //Compare to this room's items
                        if(first_arg == "cp" ||
                            first_arg == "mv" ||
                            first_arg == "less" ||
                            first_arg == "grep" ||
                            first_arg == "touch" ||
                            first_arg == "rm" ||
                            first_arg == "sudo")
                        {
                            for(item_num = 0; item_num<search_room.items.length; item_num++){
                                if(search_room.items[item_num].itemname.match("^"+path_rooms[room_num])){
                                    substring_matches.push(search_room.items[item_num].itemname);
                                }
                            }
                        }
                        
                        //If one match exists
                        if(substring_matches.length == 1){
                            path_rooms.pop();
                            path_rooms.push(substring_matches[0]);
                            split_command.push(path_rooms.join("/"))
                            $("#term").terminal().set_command(split_command.join(" "));
                        }
                        //If multiple matches exist
                        else if(substring_matches.length > 1){
                            //Search for longest common substring (taken from: http://stackoverflow.com/questions/1837555/ajax-autocomplete-or-autosuggest-with-tab-completion-autofill-similar-to-shell/1897480#1897480)
                            var lCSindex = 0
                            var i, ch, memo
                            do {
                                memo = null
                                for (i=0; i < substring_matches.length; i++) {
                                    ch = substring_matches[i].charAt(lCSindex)
                                    if (!ch) break
                                    if (!memo) memo = ch
                                    else if (ch != memo) break
                                }
                            } while (i == substring_matches.length && ++lCSindex)

                            var longestCommonSubstring = substring_matches[0].slice(0, lCSindex)
                            //If there is a common substring...
                            if(longestCommonSubstring != ""){
                                //If it already matches the last snippit, then show the options
                                if(path_rooms[room_num] == longestCommonSubstring){
                                    split_command.push(last_arg)                                                    //Join final argument to split_command
                                    $("#term").terminal().echo(">"+split_command.join(" ").replace(/\s+$/,""));     //Print what the user entered
                                    $("#term").terminal().echo(substring_matches.join(" "));                        //Print the matches
                                    $("#term").terminal().set_command(split_command.join(" ").replace(/\s+$/,""));  //Set the text to what the user entered
                                }
                                //Otherwise, fill in the longest common substring
                                else{
                                    path_rooms.pop();                           //Pop final snippit
                                    path_rooms.push(longestCommonSubstring);    //Push longest common substring
                                    split_command.push(path_rooms.join("/"))    //Join room paths
                                    $("#term").terminal().set_command(split_command.join(" ")); //Set the terminal text to this auto-completion
                                }
                            }
                            //Otherwise, there is no common substring.  Show all of the options.
                            else{
                                split_command.push(last_arg)                                                    //Join final argument to split_command
                                $("#term").terminal().echo(">"+split_command.join(" ").replace(/\s+$/,""));     //Print what the user entered
                                $("#term").terminal().echo(substring_matches.join(" "));                        //Print the matches
                                $("#term").terminal().set_command(split_command.join(" ").replace(/\s+$/,""));  //Set the text to what the user entered
                            }
                        }
                        //If no match exists
                        else{
                            //DO NOTHING (except remove TAB)
                            $("#term").terminal().set_command(command.replace(/\s+$/,""));
                        }
                    }
                    else{
                        //DO NOTHING (except remove TAB)
                        $("#term").terminal().set_command(command.replace(/\s+$/,""));
                    }
                }
            }
        }
    });
});
