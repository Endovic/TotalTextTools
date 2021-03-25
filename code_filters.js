function loadFilters()
{
    let filters = localStorage["filters"];

    if (filters == "true,true,true,true,true,true,true,true,true")
    {
        return; // https://stackoverflow.com/questions/10459207/how-can-i-exit-from-a-javascript-function
    }

    // Convert string to array: https://www.dyn-web.com/javascript/strings/split.php
    let array = filters.split(',');

    for (let i = 0; i < 9; i++)
    {
        // For this syntax (`#check${i + 1}`), see:
        // https://stackoverflow.com/questions/3304014/how-to-interpolate-variables-in-strings-in-javascript-without-concatenation
        if (array[i] == "true")
        {
            document.querySelector(`#check${i + 1}`).checked = true;
        }
        else if (array[i] == "false")
        {
            document.querySelector(`#check${i + 1}`).checked = false;
        }
    }
}

function checkAll()
{
    for (let i = 0; i < 9; i++)
    {
        document.querySelector(`#check${i + 1}`).checked = true;
    }

    localStorage["selection"] = "true,true,true,true,true,true,true,true,true";
}

function saveChanges()
{
    let selection = [];

    for (let i = 0; i < 9; i++)
    {
        selection[i] = document.querySelector(`#check${i + 1}`).checked;
    }

    localStorage["selection"] = selection;
}

function cancelChanges()
{
    let filters = localStorage["filters"];

    localStorage["selection"] = filters;
}

function gotoIndex()
{
    document.location="index.html";
}
