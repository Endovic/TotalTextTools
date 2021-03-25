// Run this function when the Results page loads after a text has been submitted for analysis:

/*global localStorage*/ //see answer by Soldeplata Saketos @ https://stackoverflow.com/questions/45015107/local-storage-not-defined/45072413

function analyzeTxt()
{
    // Get list of filters and convert into an array
    let strFilters = localStorage["filters"];
    let arrFilters = strFilters.split(',');

    // Check if visiting from Speller page and if so, print previous results without analysing text again
    if (localStorage["flag"] == "on")
    {
        let results = localStorage["results"];
        let arrResul = results.split(',');
        print(arrResul, arrFilters);
        return;
    }

    // Get text to analyze
    let text = localStorage["text"];

    // Eliminate whitespace before and after the text and whitespace repetitions within the text
    let trimmed = text.trim();
    let txt = trimmed.replace(/\s\s+/g, ' ');

    // Compute length of text (= total number of characters in text)
    let sizeTotal = text.length;        // total no. characters including whitespace at both ends
    // let sizeTrim = trimmed.length;   // no. chars excluding whitespace at both ends but including doubled spaces in-text
    let size = txt.length;              // no. chars excluding all superfluous whitespace

    // Count non-space characters, letters, sentences, words, different words and find the longest word
    // let t0 = performance.now();
    let results = iterateTxt(txt, size);
    // let t1 = performance.now();
    // console.log("It took " + (t1 - t0) + " milliseconds.");
    // console.log(results);

    // Store results sinto variables
    let numChars = results.countChars;
    let numLetters = results.countLetters;
    let numSentences = results.countSentences;
    let numWords = results.countWords;
    let numDiff = results.countDiff;
    let longWord = results.bigWrd;

    // Compute average no. words/sentence
    let average = Math.round(numWords / numSentences);
    if (isNaN(average))
    {
        average = "n/a";
    }

    // Compute readability
    let readability = colemanLiau(numLetters, numWords, numSentences);

    // Print results
    let data = [sizeTotal, numChars, numLetters, numWords, numDiff, longWord, numSentences, average, readability];
    localStorage["results"] = data;
    print(data, arrFilters);
}

function print(data, arrFilters)
{
    // https://stackoverflow.com/questions/20793306/how-to-append-content-to-queryselectorall-element-with-innerhtml-innertext
    let table = document.querySelector(".results-table");
    let row;
    let cell;

    let items = [
        "Total length", "Characters", "Letters",
        "Words", "Different words", "Longest word",
        "Sentences", "Avg. words/sentence", "Readability score"
    ];

    for (let i = 0; i < 9; i++)
    {
        if (arrFilters[i] == "true")
        {
            row = document.createElement("tr");
            table.appendChild(row);

            cell = document.createElement("td");
            cell.innerHTML = '&nbsp; &nbsp;' + items[i] + ':';
            row.appendChild(cell);

            cell = document.createElement("td");
            cell.innerHTML = data[i];
            row.appendChild(cell);
        }
    }

    // Do not display the wikipedia link if Readability score is not selected as filter
    if (arrFilters[8] == "false")
    {
        document.querySelector("a").style.display = "none";
    }

    return;
}

function iterateTxt(txt, size)
{
    // Declare/initialize variables
    let countChars = 0;
    let countLetters = 0;
    let countSentences = 0;
    let checkNflag = [0, 0];
    let countWords = 0;
    let countDiff = 0;

    let temp = [];
    let index = 0;
    let wrd;
    let lgth;

    let bigWrd;
    let bigLgth = 0;

    // Iterate over each character in the text
    for (let i = 0; i < size; i++)
    {
        // Count non-space characters
        countChars += checkChar(txt[i]);

        // Count letters
        countLetters += checkLetter(txt[i]);

        // Count sentences
        checkNflag = checkSentence(txt[i], txt[i - 1], i, checkNflag[1]);
        countSentences += checkNflag[0];

        // Check if character belongs to a word (not punctuation)
        if (!/[\s\n!\?\.,;:\[\]\(\)\{\}"«»]/.test(txt[i]))
        // Regex expression equivalent to:
        // if (txt[i] != ' ' && txt[i] != '\n' && txt[i] != '!' && txt[i] != '?' && txt[i] != '{' &&
        // txt[i] != '\.' && txt[i] != ',' && txt[i] != ';' && txt[i] != ':' && txt[i] != '[' && txt[i] != '}' &&
        // txt[i] != ']' && txt[i] != '(' && txt[i] != ')' && txt[i] != '"' && txt[i] != '«' && txt[i] != '»')
        {
            if (txt[i] != '*')  //(additional exception required for checking for differend words)
            {
                temp[index] = txt[i];
                index++;
            }
        }
        else
        {
            // Store word for further processing
            wrd = temp.join('');
            lgth = wrd.length;

            // Count words
            countWords += checkWord(txt[i - 1], lgth);

            // Count different words
            countDiff += checkDiff(txt, size, wrd, lgth, txt[i - 1], i);

            // Retain longest word
            if ((lgth > bigLgth) && (wrd.toUpperCase() != wrd.toLowerCase() || /[0-9]/.test(wrd)))
            {
                bigLgth = lgth;
                bigWrd = wrd;
            }

            temp = [];
            index = 0;
        }
    }

    // Count last sentence if it does not end with punctuation
    if (checkNflag[1] == 0) //false
    {
        if (size > 0) //(prevents adding 1 to count when blank text is submitted)
        {
            countSentences++;
        }
    }

    // Process last word if text does not end with punctuation
    wrd = temp.join('');
    lgth = wrd.length;

    // Update word count
    countWords += checkWord(wrd, lgth);

    // Clear sentence count if there are no words in the text
    if (countWords < 1)
    {
        countSentences = "n/a";
    }

    // Update different words count
    countDiff += checkDiff(txt, size, wrd, lgth, wrd, size - 1);

    // Update longest word
    if (lgth > bigLgth)
    {
        bigLgth = lgth;
        bigWrd = wrd;
    }

    if (bigWrd == null) //(write n/a when blank text is submitted)
    {
        bigWrd = "n/a";
    }

    // Compile results into an object
    return { countChars, countLetters, countSentences, countWords, countDiff, bigWrd };
}

function checkChar(ch)
{
    if (ch != ' ' && ch != '\n')
    {
        return 1;
    }
    return 0;
}

function checkLetter(ch)
{
    if (ch.toUpperCase() != ch.toLowerCase())
    {
        return 1;
    }
    return 0;
}

function checkSentence(ch1, ch2, i, f)
{
    let flag = f;

    if (ch1 == '.' || ch1 == '!' || ch1 == '?')
    {
        if (i != 0 && ch2 != '.' && ch2 != '!' && ch2 != '?')
        {
            flag = 1; //true
            return [1, flag];
        }
    }
    else
    {
        if (ch1.toUpperCase() != ch1.toLowerCase() || /[0-9]/.test(ch1))
        {
            flag = 0; //false
            return  [0, flag];
        }
        return [0, flag];
    }
    return [0, flag];
}

function checkWord(ch, lgth)
{
    if ((lgth > 0) && (ch.toUpperCase() != ch.toLowerCase() || /[0-9]/.test(ch)))
    {
        return 1;
    }
    return 0;
}

function checkDiff(txt, size, wrd, lgth, ch, i)
{
    if ((lgth > 0) && (ch.toUpperCase() != ch.toLowerCase() || /[0-9]/.test(ch)))
    {
        isDiff = searchString(txt, size, wrd, lgth, i);
        return isDiff;
    }
    return 0;
}

function searchString(txt, size, wrd, lgth, i)
{
    let pos = txt.toLowerCase().search(wrd.toLowerCase());

    if (pos < 0)
    {
        return 0;
    }

    if (lgth == 0)
    {
        return 0;
    }

    if (pos < (i - lgth))
    {
        if (pos == 0)
        {
            if (txt[pos + lgth].toUpperCase() == txt[pos + lgth].toLowerCase() || !(/[0-9]/.test(txt[i + lgth])))
            {
                return 0;
            }
            else
            {
                pos++;
            }
        }

        while (((txt[pos - 1].toUpperCase() != txt[pos - 1].toLowerCase() || /[0-9]/.test(txt[pos - 1])) ||
        (txt[pos + lgth].toUpperCase() != txt[pos + lgth].toLowerCase() || /[0-9]/.test(txt[pos + lgth]))) &&
        (pos < (i - lgth)) && ((pos + lgth) < size))
        {
            pos = txt.toLowerCase().indexOf(wrd.toLowerCase(), pos + 1);

            if (pos == i)
            {
                return 1;
            }
        }

        if (pos == (i - lgth))
        {
            return 1;
        }
        return 0;
    }
    else
    {
        return 1;
    }
}

function colemanLiau(letters, words, sentences)
{
    // Calculate: Coleman-Liau index = 0.0588 * L - 0.296 * S - 15.8
    // where, L = avg no. letters /100 words in the text, and S = avg no. sentences /100 words in the text
    let l = 100 * letters / words;
    let s = 100 * sentences / words;
    let index = Math.round(0.0588 * l - 0.296 * s - 15.8);

    let result;
    if (index >= 16)
    {
        result = "Grade 16+\n";
    }
    else if (index < 1)
    {
        result = "< Grade 1\n";
    }
    else if (isNaN(index)) //(write n/a when blank text is submitted)
    {
        result = "n/a";
    }
    else
    {
        result = "Grade " + index;
    }
    return result;
}

function gotoSpeller()
{
    document.location="speller.html";
}

function gotoIndex()
{
    document.location="index.html";
}
