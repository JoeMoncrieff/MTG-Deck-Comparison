
function buttonClick(buttonNumber) {
  var input = document.createElement('input');
  input.type = 'file';

  input.onchange = e => {

    // getting a hold of the file reference
    var file = e.target.files[0];

    // setting up the reader
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
      var content = readerEvent.target.result; // this is the content!

      //We make a function to display the content here :)
      console.log(content);
      var deckDisp;
      if (buttonNumber == 1) {
        deckDisp = document.getElementById('card-1')
      } else {
        deckDisp = document.getElementById('card-2')
      }

      deckDisp.textContent = content;

    }
  }

  input.click();
}

function splitLists(listToSplit) {
  //put into arrays
  var nonumlist = []
  console.log(listToSplit)

  console.log(nonumlist)

  for (let i = 0; i < listToSplit.length; i++) {
    elem = listToSplit[i];
    console.log(elem);
    var noOfTimes = parseInt(elem.substr(0, 1));
    console.log(noOfTimes);

    for (j = 0; j < noOfTimes; j++) {
      nonumlist.push(elem.substr(2, elem.length))
    }

  }

  return nonumlist
}


function compareDecks() {

  //Get decklists
  deck1Elem = document.getElementById('card-1');
  deck2Elem = document.getElementById('card-2');

  deck1 = deck1Elem.textContent;
  deck2 = deck2Elem.textContent;

  var list1 = deck1.split("\r\n");
  var list2 = deck2.split("\r\n");

  console.log(deck1);
  console.log(list1);

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
    if (noNumList1[index1] == noNumList2[index2]) {
      index1++;
      index2++;
    } else if (noNumList1[index1] < noNumList2[index2]) {
      //add index1 to removed list
      removed.push(noNumList1[index1]);
      index1++;
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
        added.push(noNumList1[index1]);
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

