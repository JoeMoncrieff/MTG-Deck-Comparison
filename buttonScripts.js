//Database Methods
var database;
var isLoaded = false;



function buttonClick(buttonNumber) {
  var input = document.createElement('input');
  input.type = 'file';

  input.onchange = e => {

    // getting a hold of the file reference
    var file = e.target.files[0];

    //Getting the file name and extensions for display purposes.
    var fileExt = file.name.split(".")[1];
    var fileName = file.name.split(".")[0];

    // setting up the reader
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
      var content = readerEvent.target.result; // this is the content!


      var deckDisp;
      if (buttonNumber == 1) {
        deckDisp = document.getElementById('card-1')
      } else {
        deckDisp = document.getElementById('card-2')
      }


      //Depending on the file type we need to decipher it in different ways
      if (fileExt.toUpperCase() == "DEK") {
        DecipherForDek(content, deckDisp);
      } else if (fileExt.toUpperCase() == "TXT") {
        var dict = {};
        var qty;


        var contentArray = content.split("\r\n");
        for (i = 0; i < contentArray.length; i++) {
          
          if (contentArray[i] == ""){
            continue;
          } else {
            qty = 0;
            var name = "";
            line = contentArray[i].trim();
            lineParts = line.split(" ");
            
            qty = lineParts[0];
            name = line.substring(qty.length).trim("").toLowerCase();
            console.log(name);
            name=name.trim("");
            qty = parseInt(qty);
            
        
            if (name in dict){
              dict[name] += qty;
            } else {
              dict[name] = qty;
            } 
          }
        }

        sortCards = Object.keys(dict)
        sortCards.sort();
        console.log(sortCards);

        addListToDeckCard(dict, sortCards, deckDisp, true);
      }
    }
  }
  input.click();
}

//Helper function for sort array
function splitLists(listToSplit) {
  //put into arrays
  var nonumlist = []
  console.log(listToSplit)

  console.log(nonumlist)

  for (let i = 0; i < listToSplit.length; i++) {
    elem = listToSplit[i];
    console.log(elem);
    var seperate = elem.split(" ");

    var noOfTimes = parseInt(seperate[0]);
    //console.log(noOfTimes);

    for (j = 0; j < noOfTimes; j++) {
      nonumlist.push(elem.substr(seperate[0].length, elem.length))
    }

  }

  return nonumlist
}


function addCopyPaste(number) {
  var deckElem;
  dict = {};
  returnString = "";

  //check for which element you want to add it to
  if (number == 1) {
    deckElem = document.getElementById('card-1');
  } else if (number == 2) {
    deckElem = document.getElementById('card-2');
  }
  //resetting list here
  deckElem.textContent = "";


  //Get the text area text.
  textAreaElem = document.getElementById('deck-box');
  text = textAreaElem.value
  //split on new line
  textArr = text.split("\n")


  //This 'for loop' assumes the formatting is "qty CARD_NAME"
  for (i = 0; i < textArr.length; i++) {
    qty = 0;
    var name = "";
    line = textArr[i].trim();
    lineParts = line.split(" ");
    
    qty = lineParts[0];
    name = line.substring(qty.length).trim("");
    qty = parseInt(qty);
    

    if (name in dict){
      dict[name] += qty;
    } else {
      dict[name] = qty;
    }

    //TODO: Caps lock differences can mess up duplicates here
   
  }
  sortCards = Object.keys(dict)
  sortCards.sort();

  addListToDeckCard(dict, sortCards, deckElem, true);
}

//This function converts dicts into popover tags ustilising the database
function addListToDeckCard(nameQtyDict, sortedNameList, deckElement, removePrevious) 
{
  //remove previous list if not strictly additive;
  if (removePrevious) {
    deckElement.textContent = "";
  } else {
    var space = document.createElement("p");
    space.textContent = "\r\n";
    deckElement.appendChild(space);
  }
  for (i = 0; i < sortedNameList.length; i++) {
    var name = sortedNameList[i];
    
    //Tag Adding Section here
    if (isLoaded) {
      //console.log(name);
      
      var cardImage = GetImage(database, name);
      var aTag = CreateATag(cardImage, name, nameQtyDict[name]);

      //console.log(aTag);
      deckElement.appendChild(aTag);
    }
  }
}

function compareDecks() {

  //Get decklists
  deck1Elem = document.getElementById('card-1');
  deck2Elem = document.getElementById('card-2');

  deck1 = deck1Elem.textContent;
  deck2 = deck2Elem.textContent;

  console.log(deck1);
  console.log(deck1.childNodes);
  console.log(deck1.children);

  var list1 = deck1.split("\r\n");
  var list2 = deck2.split("\r\n");

  
  console.log(list1);
  console.log(list2);

  noNumList1 = splitLists(list1);
  noNumList2 = splitLists(list2);

  noNumList1.sort();
  noNumList2.sort();

  //Comparison algorithm
  var added = [];
  var removed = [];

  index1 = 0;
  index2 = 0;

  while (true) {
    //Case where both are equivalent
    if (noNumList1[index1] == noNumList2[index2]) {
      index1++;
      index2++;
    //Case where left list is alphabetically smaller
    } else if (noNumList1[index1] < noNumList2[index2]) {
      //add index1 to removed list
      removed.push(noNumList1[index1]);
      index1++;
    //Case where right list is alphabetically smaller
    } else {
      added.push(noNumList2[index2]);
      index2++;
    }

    if (index1 >= noNumList1.length) {
      while (index2 < noNumList2.length) {
        added.push(noNumList2[index2]);
        index2++;
      }
      break;
    }

    if (index2 >= noNumList2.length) {
      while (index1 < noNumList1.length) {
        removed.push(noNumList1[index1]);
        index1++;
      }
      break;
    }
  }

  console.log(added);
  console.log(removed);

  addedText = addToComparison(added, "");
  removedText = addToComparison(removed, "");

  var addedHTML = document.getElementById("cards-added");
  addedHTML.textContent = addedText;
  var removedHTML = document.getElementById("cards-removed");
  removedHTML.textContent = removedText;

}

function addToComparison(arr, sign) {
  text = ""

  var tempNum = 1;
  for (i = 0; i < arr.length; i++) {
    if (i + 1 != arr.length) {
      if (arr[i] == arr[i + 1]) {
        tempNum++;
      } else {
        text += (sign + tempNum.toString() + " " + arr[i] + "\n")
        tempNum = 1;
      }
    } else {
      text += (sign + tempNum.toString() + " " + arr[i] + "\n")
      tempNum = 1;

    }
  }

  return text;
}

//we are given a Dek file in string format
//cards or in the form: <Cards CatID="23248" Quantity="2" Sideboard="false" Name="Selesnya Sanctuary" Annotation="0" />

function DecipherForDek(cardList, deckElement) {
  var mainBoard = ""
  var sideBoard = ""
  var dictMB = {}
  var dictSB = {}


  //Remove all White Space
  cardList.replace(/\s+/g,'')
  // Split on "<"
  cardElementList = cardList.split("<")
  //For each
  for (i = 0; i < cardElementList.length; i++) {
    card = cardElementList[i];
    //Check if card
    if (card.substring(0, 5) === "Cards") {

      var qty = 0;
      var name = "";
      var sb = 'true';
      card = card.substring(5)
      attachments = card.split("\"")

      for (j = 0; j < attachments.length; j = j + 2) {
        curr = attachments[j];
        //console.log(curr);
        if (curr.trim() == "Quantity=".trim()) {
          qty = attachments[j+1]
        } else if (curr.trim() == "Sideboard=".trim()) {
          sb = attachments[j+1]
        } else if (curr.trim() == "Name=".trim()) {
          name = attachments[j + 1]
        }
      }

      // Sorting requires alphabetical order
      // We us a dictionary here so we can sort the keys later

      if (sb === 'false') {
        dictMB[name] = qty
      } else {
        dictSB[name] = qty
      }

    }
  }

  //Mass sorting alphabetically
  sortMB = Object.keys(dictMB)
  sortMB.sort();
  
  addListToDeckCard(dictMB,sortMB,deckElement,true);

  sortSB = Object.keys(dictSB);
  sortSB.sort();
  
  addListToDeckCard(dictSB,sortSB,deckElement,false);
}

// Loading the database

function LoadHelper (d) {
  database = d;
  isLoaded = true;
  console.log("dbLoaded");
}

var dataFile = fetch("res/databases/scryfall-cleaned.json")
                .then(response => response.json())
                .then(data => LoadHelper(data));

//Loading the database end

// Creating an 'a' Tag function

function CreateATag (imgName, cardName, qty) {
  
  var dataContent;
  if (imgName == "notfound") {
    dataContent = '<img src="res/databases/CardNotFoundSmall.png"></img>';
  } else {
    dataContent = '<img src="' + imgName + '"></img>';
  }


  var newCard = document.createElement("a");
  newCard.textContent = qty + " " +cardName+ "\r\n";
  newCard.setAttribute("data-trigger", "hover");
  newCard.setAttribute("data-toggle", "popover");
  newCard.setAttribute("data-html", "true");
  newCard.setAttribute("data-content", dataContent);
  $(function () {
    $('[data-toggle="popover"]').popover()
  })
  return newCard;
} 

function GetImage(db, textName) {
  //TODO: Issue with double-faced cards - look into solutions;
  if (typeof db[textName.toLowerCase()] !== "undefined"){
    return db[textName.toLowerCase()]["small"];
  } else {
    return "notfound";
  }
  

  // if (textName.toLowerCase() in Object.keys(db)){
  //   return db[textName.toLowerCase()]["small"];
  // } else {
  //   console.log(db);
  //   return false
  // }
  
}




