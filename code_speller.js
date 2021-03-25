function dictionary()
{
    // Abort and display error message if no text was submitted
    if (!localStorage["text"])
    {
        document.querySelector("#intro").innerHTML = "Please return to main page and insert text for analysis.";
        return;
    }

    // Check if re-visiting from Results page without new text input and if so, print previous results without spell-checking again
    if (localStorage["flag"] == "on")
    {
        let spelling = localStorage["spelling"];
        if (spelling)
        {
            let arrSpel = spelling.split(',');
            print(arrSpel);
            return;
        }
        else
        {
            document.querySelector("#intro").innerHTML = "<b>0</b>" + " mispelled words: ";
            return;
        }
    }

    // Initialize dictionary
    let dict = localStorage["dict"];

    if (dict)
    {
        // If there's a dictionary in memory send it to spell-checking function and print the resulting list of mispelled words
        let mispelList = spellCheck(dict);
        print(mispelList);
    }
    else
    {
        // If there's no dictionary in memory load a new dictionary
        loadDict();

        // Display message while dictionary is being loaded
        let t = document.querySelector("#intro");
        t.innerHTML = "Checking...";
        // https://www.w3schools.com/jsref/met_win_settimeout.asp
        // setTimeout(function(){ t.appendChild(document.createTextNode(".")); }, 200);
        // setTimeout(function(){ t.appendChild(document.createTextNode(".")); }, 400);
        // setTimeout(function(){ t.appendChild(document.createTextNode(".")); }, 600);
        // setTimeout(function(){ t.appendChild(document.createTextNode(".")); }, 800);
        // setTimeout(function(){ t.appendChild(document.createTextNode(".")); }, 1000);
    }
}

// https://www.quora.com/What-is-the-way-to-have-Javascript-read-from-a-txt-file
// also, see response 105 for fetch API alternative: https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function loadDict()
{
    //let t0 = performance.now();
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", "dictionary", true);
    rawFile.onreadystatechange = function() {

        if (rawFile.readyState === 4)
        {
            if (rawFile.status === 200 || rawFile.status == 0)
            {
                let fullDict = rawFile.responseText; // Store the content of the dictionary file (as a string)

                localStorage["dict"] = fullDict.replace(/\n/g, ' '); // Save string as words separated by spaces, not line breaks

                dict = localStorage["dict"];
                mispelList = spellCheck(dict);
                print(mispelList);
                //let t1 = performance.now();
                //console.log("It took " + (t1 - t0) + " milliseconds.");
            }
        }
    }
    rawFile.send(null);
}

function spellCheck(dict)
{
    // Get text to analyze (from user input)
    let text = localStorage["text"];

    // Split the whole text string into an array of individual words exluding all spaces and punctuation
    let array = text.split(/[\s\n!\?\.,;:\[\]\(\)\{\}"«»\\\/\|#\$%&\*\+-@`~\^]/);
    let lgth = array.length;

    // Create a mispelled words list (array)
    let mispelList = [];

    // Spell-check each word from text
    for (let i = 0; i < lgth; i++)
    {
        // Create a regex object for each iterated word from text
        // (\b is a boundary marker to ensure that only individual words are picked up, excluding substrings in larger words)
        // (i is a modifier to allow case-insensitive matching)
        // for syntax, see "Dynamically creating RegExp objects" in: https://eloquentjavascript.net/09_regexp.html
        let regx = new RegExp("\\b" + array[i] +"\\b", "i");

        // Check if word is in the dictionary (test for a match)
        if (!regx.test(dict))
        {
            // Add any words not included in the dictionary to the mispelled list
            mispelList.push(array[i]);
        }
    }
    return mispelList;
}

function print(mispelList)
{
    // Convert the array into a set, removing all duplicates, and immediately convert the set back to an array
    // https://wsvincent.com/javascript-remove-duplicates-array/
    let mispelSet = [...new Set(mispelList)];

    localStorage["spelling"] = mispelSet;

    // Compute length of the array, equivalent to mispelled words count
    let lgth = mispelSet.length;

    // https://stackoverflow.com/questions/20793306/how-to-append-content-to-queryselectorall-element-with-innerhtml-innertext
    document.querySelector("#intro").innerHTML = "<b>" + lgth + "</b>" + " mispelled words: ";

    let l = document.querySelector("#list");
    let list = document.createElement("ul");
    l.appendChild(list);

    let bullets;

    for (let i = 0; i < lgth; i++)
    {
        bullets = document.createElement("li");
        bullets.innerHTML = mispelSet[i];
        list.appendChild(bullets);
    }
}

function gotoIndex()
{
    document.location="index.html";
}

function gotoResults()
{
    localStorage["flag"] = "on";

    document.location="results.html";
}
