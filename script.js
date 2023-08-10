let notes = [];
let trashNotes = [];
let searchIsActive = false;

const dataForRenderingNotes = {
    'onclickFunctions': ['moveToTrash', 'renderEditScreen'],
    'icons': ['delete-32_gray.png', 'edit-2-32.png', 'idea-128.png'],
    'signIds': ['trash-sign', 'edit-sign'],
    'signTexts': ['Move to trash', 'Edit'],
    'textForEmptyContainer': 'Your notes will be displayed here',
    'activeNavIds': ['note-icon', 'nav-notes'],
    'inactiveNavIds': ['trash-icon', 'nav-trash']
};
const dataForRenderingTrash = {
    'onclickFunctions': ['renderDeletionConfirmation', 'recoverFromTrash'],
    'icons': ['delete-32_gray.png', 'reuse-32.png', 'delete-128.png'],
    'signIds': ['delete-sign', 'recover-sign'],
    'signTexts': ['Delete permanently', 'Recover'],
    'textForEmptyContainer': 'No notes in your trash',
    'activeNavIds': ['trash-icon', 'nav-trash'],
    'inactiveNavIds': ['note-icon', 'nav-notes']
};


loadFromLocalStorage();


function toggleNav() {
    const navIsOpen = document.getElementById('nav-text').classList.contains('show-nav');
    if (navIsOpen) hideNav();
    else showNav();
}


function showNav() {
    document.getElementById('nav-text').classList.add('show-nav');
    document.getElementById('burger-menu').classList.add('orange-bg');
    document.getElementById('note-icon').classList.add('nav-icon-extended-bg');
    document.getElementById('trash-icon').classList.add('nav-icon-extended-bg');
}


function hideNav() {
    document.getElementById('nav-text').classList.remove('show-nav');
    document.getElementById('burger-menu').classList.remove('orange-bg');
    document.getElementById('note-icon').classList.remove('nav-icon-extended-bg');
    document.getElementById('trash-icon').classList.remove('nav-icon-extended-bg');
}


function addHoverBackgroundNav(iconId, textId) {
    document.getElementById(iconId).classList.add('gray-bg');
    document.getElementById(textId).classList.add('gray-bg');
}


function removeHoverBackgroundNav(iconId, textId) {
    document.getElementById(iconId).classList.remove('gray-bg');
    document.getElementById(textId).classList.remove('gray-bg');
}


function renderNotes(arrayOfNoteObjects = notes) {
    let content = document.getElementById('notes-container');
    let dataForRendering = dataForRenderingNotes;

    if (arrayOfNoteObjects === trashNotes) {
        dataForRendering = dataForRenderingTrash;
    }

    content.innerHTML = '';

    if (arrayOfNoteObjects.length) {
        content.classList.remove('f-center');
        for (i = arrayOfNoteObjects.length - 1; i >= 0; --i) {
            content.appendChild(renderNote(i, arrayOfNoteObjects, dataForRendering));
        }
    }
    else {
        content.classList.add('f-center');
        content.innerHTML += renderEmptyContainer(dataForRendering);
    }

    for (let i = 0; i < dataForRendering.activeNavIds.length; i++) {
        document.getElementById(dataForRendering.activeNavIds[i]).classList.add('orange-bg');
        document.getElementById(dataForRendering.inactiveNavIds[i]).classList.remove('orange-bg');
    }

    document.getElementById('notes-container').classList.remove('f-column');
    searchIsActive = false;
}


function renderNote(index, arrayOfNoteObjects = notes, dataForRendering = dataForRenderingNotes) {
    let notesIndexIfEditingSearchResults = index;
    if (dataForRendering === dataForRenderingNotes) {
        notesIndexIfEditingSearchResults = notes.indexOf(arrayOfNoteObjects[index]);
    } /* für arrayOfNoteObjects == notes kommt hier wieder index raus,
     ansonsten, wenn aus der Suche heraus editiert wird, nimmt man hier den ursprünglichen notes-Index */

    let output = document.createElement('div');
    output.classList.add('note');
    output.innerHTML = `
            <span class="note-title">${arrayOfNoteObjects[index].title}</span>
            <p class="note-text">${arrayOfNoteObjects[index].text}</p>
            <div class="btn-container">
                <button type="submit" class="btn icon-btn" onmouseenter="showElement('${dataForRendering.signIds[0]}-${index}')" onmouseleave="hideElement('${dataForRendering.signIds[0]}-${index}')" onclick="${dataForRendering.onclickFunctions[0]}(${index})">
                    <img src="img/${dataForRendering.icons[0]}">
                    <span id="${dataForRendering.signIds[0]}-${index}" class="hover-pop-up-sign ${dataForRendering.signIds[0]} d-none">
                        ${dataForRendering.signTexts[0]}
                    </span>
                </button>
                <button type="submit" class="btn icon-btn" onmouseenter="showElement('${dataForRendering.signIds[1]}-${index}')" onmouseleave="hideElement('${dataForRendering.signIds[1]}-${index}')" onclick="${dataForRendering.onclickFunctions[1]}(${notesIndexIfEditingSearchResults})">
                    <img src="img/${dataForRendering.icons[1]}">
                    <span id="${dataForRendering.signIds[1]}-${index}" class="hover-pop-up-sign ${dataForRendering.signIds[1]} d-none">
                        ${dataForRendering.signTexts[1]}
                    </span>
                </button>     
            </div>
    `;

    return output;
}


function renderEmptyContainer(dataForRendering) {
    const output = `
        <div class="empty-container">
            <img src="img/${dataForRendering.icons[2]}"><br>
            <span>${dataForRendering.textForEmptyContainer}</span>
        </div>
    `;

    return output;
}


function showElement(id) {
    if (document.getElementById(id).classList.contains('d-none'))
        document.getElementById(id).classList.remove('d-none');
}


function hideElement(id) {
    document.getElementById(id).classList.add('d-none');
}


function addNote() {
    let note = {};
    note.title = document.getElementById('input-note-title').value;
    note.text = document.getElementById('input-note-text').value;

    validate('input-note-text');

    if (document.getElementById('input-note-text').checkValidity()) {
        notes.push(note);

        renderNotes();
        saveToLocalStorage();
        clearInput('input-note-title');
        clearInput('input-note-text');
    }
}


function clearInput(inputId) {
    document.getElementById(inputId).value = '';
}


function moveToTrash(noteIndex) {
    trashNotes.push(notes[noteIndex]);
    notes.splice(noteIndex, 1);

    if (searchIsActive) search();
    else renderNotes();
    saveToLocalStorage();
}


function recoverFromTrash(noteIndex) {
    notes.push(trashNotes[noteIndex]);
    trashNotes.splice(noteIndex, 1);

    if (searchIsActive) search();
    else renderNotes(trashNotes);
    saveToLocalStorage();
}


function renderDeletionConfirmation(noteIndex) {
    showElement('gray-screen-container');
    let content = document.getElementById('gray-screen-container');

    content.innerHTML = `
        <div class="input-note deletion-confirmation white-bg">
            <span class="deletion-confirmation-text">Do you want to delete this note permanently?</span>
            <div class="btn-container">
                <button type="submit" class="btn text-btn" onclick="deleteNote(${noteIndex})">
                    Delete
                </button>
                <button type="submit" class="btn text-btn" onclick="cancelAction()">
                    Cancel
                </button>
            </div>
        </div>
    `;
}


function deleteNote(noteIndex) {
    trashNotes.splice(noteIndex, 1);

    hideElement('gray-screen-container');
    if (searchIsActive) search();
    else renderNotes(trashNotes);
    saveToLocalStorage();
}


function saveToLocalStorage() {
    let notesAsText = JSON.stringify(notes);
    let trashNotesAsText = JSON.stringify(trashNotes);

    localStorage.setItem('notes', notesAsText);
    localStorage.setItem('trashNotes', trashNotesAsText);
}


function loadFromLocalStorage() {
    let notesAsText = localStorage.getItem('notes');
    let trashNotesAsText = localStorage.getItem('trashNotes');

    if (notesAsText) {
        notes = JSON.parse(notesAsText);
    }
    if (trashNotesAsText) {
        trashNotes = JSON.parse(trashNotesAsText);
    }
}


function search() {
    const input = document.getElementById('search-input');
    const searchString = input.value;

    validate('search-input');

    if (input.checkValidity()) {

        const results = notes.filter(obj =>
            obj.title.toLowerCase().includes(searchString.toLowerCase()) ||
            obj.text.toLowerCase().includes(searchString.toLowerCase())
        );
        const trashResults = trashNotes.filter(obj =>
            obj.title.toLowerCase().includes(searchString.toLowerCase()) ||
            obj.text.toLowerCase().includes(searchString.toLowerCase())
        );

        renderSearchResults(searchString, results, false);
        renderSearchResults(searchString, trashResults, true);

        searchIsActive = true;
    }
    else {
        renderNotes();
    }
}


function validate(inputID) {
    const input = document.getElementById(inputID);
    const validityState = input.validity;

    if (validityState.valueMissing) {
        input.setCustomValidity(`Please fill in something`);
    } else {
        input.setCustomValidity('');
    }

    input.reportValidity();
}


function renderSearchResults(searchString, results, isTrash) {
    let content = document.getElementById('notes-container');
    if (!isTrash) content.innerHTML = '';

    let headline = renderSearchResultHeadline(searchString, results, isTrash);
    let searchResultsContainer = document.createElement('div');
    searchResultsContainer.classList.add('search-results');

    content.appendChild(headline);
    content.appendChild(searchResultsContainer);
    renderSearchResultsList(searchResultsContainer, results, isTrash);

    document.getElementById('notes-container').classList.add('f-column');
}


function renderSearchResultHeadline(searchString, results, isTrash) {
    let headlineText = results.length ?
        `Search results for "${searchString}" ${isTrash ? 'in Trash' : 'in Notes'}:` :
        `No search results for "${searchString}" ${isTrash ? 'in Trash' : 'in Notes'}`;

    let headline = document.createElement('b');
    headline.classList.add('search-results-headline')
    headline.innerHTML = `${headlineText}`;

    return headline;
}


function renderSearchResultsList(container, results, isTrash) {
    let dataForRendering = isTrash ? dataForRenderingTrash : dataForRenderingNotes;

    for (i = results.length - 1; i >= 0; --i) {
        container.appendChild(renderNote(i, results, dataForRendering));
    }
}


function renderEditScreen(noteIndex) {
    showElement('gray-screen-container');
    let content = document.getElementById('gray-screen-container');

    content.innerHTML = `
        <div class="input-note white-bg">
            <input id="edit-note-title" class="input-note-title" placeholder="Title" value="${notes[noteIndex].title}" title="">
            <textarea id="edit-note-text" class="input-note-text" rows="5" title="" required>${notes[noteIndex].text}</textarea>
            <div class="btn-container">
                <button type="submit" class="btn text-btn" onclick="saveEdit(${noteIndex})">
                    Save
                </button>
                <button type="submit" class="btn text-btn" onclick="cancelAction()">
                    Cancel
                </button>
            </div>
        </div>
    `;
}


function saveEdit(noteIndex) {
    notes[noteIndex].title = document.getElementById('edit-note-title').value;
    notes[noteIndex].text = document.getElementById('edit-note-text').value;

    hideElement('gray-screen-container');
    if (searchIsActive) search();
    else renderNotes();
    saveToLocalStorage();
}


function cancelAction() {
    hideElement('gray-screen-container');
}


/*-------------------------------------
Trigger Button Click on Enter
--------------------------------------*/
// Get the input field
let input = document.getElementById('search-input');

// Execute a function when the user presses a key on the keyboard
input.addEventListener('keypress', function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === 'Enter') {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById('search-icon').click();
    }
});
