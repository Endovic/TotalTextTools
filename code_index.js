function saveText()
{
   localStorage["text"] = document.querySelector("#string").value;
}

function saveFilters()
{
    let filters = localStorage["selection"];

    if (filters)
    {
        localStorage["filters"] = filters;
    }
    else
    {
        localStorage["filters"] = "true,true,true,true,true,true,true,true,true";
    }
}

function warning()
{
    document.querySelector("#info-banner").innerHTML = "<div class='alert alert-dark' role='alert' style='text-align: center;'>" +
    "<b>\></b> Texts longer than 100,000 characters may take several seconds to process\.</div>";
}

function info()
{
    alert("Find out how many characters, letters," + '\n' +
    "words, sentences (and much more)" + '\n' +
    "there are in a text. Also includes" + '\n' +
    "readability scoring and spell checking\.");
}

function gotoResults()
{
    localStorage["flag"] = "off";
    localStorage["results"] = '';
    localStorage["spelling"] = '';

    document.location="results.html";
}

function gotoFilters()
{
    document.location="filters.html";
}
