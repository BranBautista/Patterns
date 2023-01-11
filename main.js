import {dragEnter, dragLeave, dragOver } from "./functionsDrag.js";

function showNotes(notes) {
    document.querySelectorAll(".note").forEach(note => note.remove());

    notes.forEach((note, index) => {

        editRegisterObj.push({
            title: note.title,
            body: note.body,
            id: index,
            lastEdit: [],
        })
        editRegisterObj[index].lastEdit.push(note.date);
        if (isUpdate === false){
            let creationDate = editRegisterObj[index].lastEdit[0];
            localStorage.setItem(`creationDate${index}`, creationDate);
        }

        let divNote = document.createElement("div"); 
            divNote.setAttribute("id", `${index}`);
            divNote.setAttribute("class", "note");
            divNote.setAttribute("draggable", "true");
        
        let divDetails = document.createElement("div");
            divDetails.setAttribute("class", "details");
        
        let divFoot = document.createElement("div");
            divFoot.setAttribute("class", "foot");

        let title = document.createElement("p");
            title.textContent = `${note.title}`;
        
        let body = document.createElement("span");
            body.textContent = `${note.body}`;

        
        let displayFoot = `<span>Last edit: ${note.date}</span>
        <br>
        <span>Created at: ${localStorage.getItem(`creationDate${index}`)}</span>
        <br>`

        let linkDelete = document.createElement("a");
            linkDelete.setAttribute("class", "delete");
            linkDelete.setAttribute("href", "#");
            linkDelete.onclick = function() {deleteNote(index)};
            linkDelete.textContent = "Delete";
            
        let linkEdit = document.createElement("a");
            linkEdit.setAttribute("class", "edit");
            linkEdit.setAttribute("href", "#");
            linkEdit.setAttribute("id", "editBtn");
            linkEdit.onclick = function() {editNote(index, note.title, note.body)};
            linkEdit.textContent = "Edit";

        divDetails.appendChild(title)
        divDetails.appendChild(body)

        divFoot.appendChild(linkDelete);
        divFoot.appendChild(linkEdit);

        divFoot.insertAdjacentHTML("afterbegin", displayFoot); 

        divNote.appendChild(divDetails);
        divNote.appendChild(divFoot);

        cloneTemplate.appendChild(divNote)
        notesContainer.appendChild(cloneTemplate);

        addEventListeners();
    });
}

//This function will delete the selected note
function deleteNote(noteId) {
    if (confirm("You really want to delete the note?")==true) {
        isDelete = true;
        //remove selected note from the array 'notes'
        notes.splice(noteId, 1);
        //We pass to a string the 'notes' array
        // notesString = JSON.stringify(notes);
        //save updated notes to local storage
        localStorage.setItem("notes", JSON.stringify(notes));
        //Show to the page the notes without the deleted one
        localStorage.removeItem(`creationDate${noteId}`);
        showNotes(notes);
    }
}

//This function will edit the selected note
function editNote(noteId, title, body) {
    isUpdate = true;
    updateId = noteId;
    // noteNoEdited = notes[updateId];
    popUpBox.classList.add("show");
    popupTitleTag.value = notes[noteId].title;
    popupBodyTag.value = notes[noteId].body;
    popupTitleTag.focus();
    
    //Here I use the last date of edit in order to save it in the dateHelp variable 

    let lengthArray = editRegisterObj[noteId].lastEdit.length
    let editRegister = JSON.stringify(editRegisterObj[noteId].lastEdit[lengthArray-1])
    dateHelp = editRegister;
}

// -------- Here starts the drag functionality

function dragStart(){
    dragStartIndex = +this.closest('div').getAttribute('id');
}

function dragDrop(){
    const dragEndIndex = +this.getAttribute('id');
    swapItems(dragStartIndex, dragEndIndex);
}

function swapItems(fromIndex,toIndex){
    let theNote = document.querySelectorAll('.note')
    indexFrom = fromIndex;
    indexTo = toIndex;

    let temp = theNote[fromIndex].innerHTML;
    theNote[fromIndex].innerHTML = theNote[toIndex].innerHTML
    theNote[toIndex].innerHTML = temp;
    localStorage.setItem("notes", JSON.stringify(notes));
    isOrdering = true;
    saveCommand()
}

function addEventListeners(){
    const draggables = document.querySelectorAll('.note');
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', dragStart)
    })

    draggables.forEach(item => {
        item.addEventListener('dragover', dragOver)
        item.addEventListener('drop', dragDrop)
        item.addEventListener('dragenter', dragEnter)
        item.addEventListener('dragleave', dragLeave)
    })
}

// ------- Here starts the undo button functionality

function saveCommand(objectHistory,noteId) {
    if (isDelete){
        commands.push(
            {type: "delete",
            object: objectHistory,
            noteId: noteId
            });
        isDelete = false;
    }
    else if(isEdit){
        commands.push(
            {type: "edit",
            object:objectHistory,
            noteId: noteId
            });
        isEdit = false;
    }
    else if(isCreate){
        commands.push(
            {type: "create",
            object:objectHistory,
            noteId: noteId
            });
        isCreate = false;
    }
    else if(isOrdering){
        commands.push(
            {type: "ordering",
            object:"",
            noteId:""
            })
        isOrdering = false;
    }
    
    localStorage.setItem("commands", JSON.stringify(commands));
}

const submit = document.getElementById("btnsubmit");
const titleTag = document.getElementById("notetitleinput");
const bodyTag = document.getElementById("notebodyarea");
const popupTitleTag = document.getElementById("popup-notetitleinput");
const popupBodyTag = document.getElementById("popup-notebodyarea");
const popUpBox = document.getElementById("popup-box");
const closeIcon = document.getElementById("close-icon");
const updateNote = document.getElementById("update-note");
const notesContainer = document.getElementById("notesContainer");
const searchBar = document.getElementById("searchBar");
const submitSearch = document.getElementById("btnsearch");
const submitUndo = document.getElementById("btnundo");
const template = document.getElementById("template");
const cloneTemplate = template.content.cloneNode(true);

let editRegisterObj = [];
let filteredNotes = [];
let dateHelp = "";
let noteNoEdited;
let isUpdate = false, updateId;
let isEdit = false;
let isDelete = false;
let isCreate = false;
let isOrdering = false;
let indexFrom, indexTo;
let dragStartIndex;

const notesLocalStorage = localStorage.getItem("notes");
const notes = JSON.parse(notesLocalStorage || "[]");
const commandsLocalStorage = localStorage.getItem("commands");
const commands = JSON.parse(commandsLocalStorage || "[]");

showNotes(notes);

submit.addEventListener("click", e => {
    e.preventDefault();
    let noteTitle, noteBody
    if (!isUpdate){
    noteTitle = titleTag.value;
    noteBody = bodyTag.value;
    }
    else{
        noteTitle = popupTitleTag.value;
        noteBody = popupBodyTag.value;
    }

    if (noteTitle || noteBody) {

        //Here we get the current date
        let dateObj = new Date()

        let options = {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'America/Los_Angeles'};
        let currentDate = new Intl.DateTimeFormat('en-US', options).format(dateObj);

        let noteStructure ={};
        
        //We define the structure of the note

        if (dateHelp == ""){ //If is new note
            noteStructure = {
                title: noteTitle,
                body: noteBody,
                date: currentDate,
                editDate: currentDate
            }
        }
        else {
            noteStructure = { //Is is an edition
                title: noteTitle,
                body: noteBody,
                date: currentDate,
                editDate: dateHelp
            }
        }

        dateHelp = "";

        // We will save all the notes on the next array
        // and we will add the notes to the array notes

        if (!isUpdate){
            notes.push(noteStructure);
            isCreate = true;
        }
        else
        {
            notes[updateId] = noteStructure;
            isEdit = true;
        }

        localStorage.setItem("notes", JSON.stringify(notes));

        if(notes.length != 0){
            if (!isUpdate){
                saveCommand(notes[notes.length-1], notes.length-1);
            }
            else
            {
                saveCommand(noteNoEdited,updateId);
                isEdit = true;
                saveCommand(notes[updateId], updateId);
            }
        }


        console.log(notes)
        showNotes(notes);

        //We reset the value of the input and textarea
        titleTag.value = "";
        bodyTag.value = "";
    }
})

// ---------- Buttons for the emergent window

closeIcon.addEventListener("click", ()=>{
    popUpBox.classList.remove("show");
})

updateNote.addEventListener("click", ()=>{
    submit.click();
    isUpdate = false;
    closeIcon.click();
})

//--------- This event will enable the use of the Tab key

bodyTag.addEventListener('keydown', (event) => {
    let start, end, beforeTab, afterTab, newString;
    if (event.keyCode === 9) {
        event.preventDefault();
        start = bodyTag.selectionStart;
        end = bodyTag.selectionEnd;
        beforeTab = bodyTag.value.substring(0, start);
        afterTab = bodyTag.value.substring(end);
        newString = beforeTab + "\t" + afterTab;
        bodyTag.value = newString
        bodyTagselectionStart = start + 1
        bodyTagselectionEnd = start + 1
        return false;
    }
})

popupBodyTag.addEventListener('keydown', (event) => {
    let start, end, beforeTab, afterTab, newString;
    if (event.keyCode === 9) {
        event.preventDefault();
        start = popupBodyTag.selectionStart;
        end = popupBodyTag.selectionEnd;
        beforeTab = popupBodyTag.value.substring(0, start);
        afterTab = popupBodyTag.value.substring(end);
        newString = beforeTab + "\t" + afterTab;
        popupBodyTag.value = newString
        bodyTagselectionStart = start + 1
        bodyTagselectionEnd = start + 1
        return false;
    }
})

// -------- Here starts the search functionality

submitSearch.addEventListener("click", e => {
    e.preventDefault();
    const searchString = searchBar.value;
    filteredNotes = notes.filter(note =>{
        return note.body.includes(searchString) || note.title.includes(searchString);
    })
    showNotes(filteredNotes);
})
    
searchBar.addEventListener("keyup", (e) => {
    if( e.target.value == ""){
        showNotes(notes)
    }
})

// ------- Here starts the undo button functionality

submitUndo.addEventListener("click", e => {
    e.preventDefault();
    console.log("hey")
    let lastCommand = commands.pop();
    if(lastCommand){
        if(lastCommand.type == "delete"){
            notes.splice(lastCommand.noteId,0,lastCommand.object);
            localStorage.setItem("notes", JSON.stringify(notes));
            showNotes(notes);
        }
        else if (lastCommand.type == "create"){
            notes.pop();
            localStorage.setItem("notes", JSON.stringify(notes));
            showNotes(notes);
        }
        else if (lastCommand.type == "edit"){
            lastCommand = commands.pop();
            notes.splice(lastCommand.noteId,1,lastCommand.object);
            localStorage.setItem("notes", JSON.stringify(notes));
            showNotes(notes);
        }
        else if (lastCommand.type == "ordering"){
            let theNote = document.querySelectorAll('.note')
            let indexToUndo= indexFrom;
            let indexFromUndo= indexTo;

            let temp = theNote[indexFromUndo].innerHTML;
            theNote[indexFromUndo].innerHTML = theNote[indexToUndo].innerHTML
            theNote[indexToUndo].innerHTML = temp;
            localStorage.setItem("notes",  JSON.stringify(notes));
        }
    }
}) 
