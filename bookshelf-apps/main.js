const incompleteBookshelfList = [];
const RENDER_EVENT = 'render-book';
let bookIdToDelete;

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (checkForStorage()) {
        loadDataFromStorage();
    }
});

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const yearString = document.getElementById('inputBookYear').value;
    const year = parseInt(yearString);
    const isComplete = document.getElementById('inputBookIsComplete').checked;
    
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
    
    incompleteBookshelfList.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    alert('Buku baru berhasil ditambahkan!')
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedList = document.getElementById('incompleteBookshelfList');
    uncompletedList.innerHTML = '';
    
    const completedList = document.getElementById('completeBookshelfList');
    completedList.innerHTML = '';
   
    for (const bookItem of incompleteBookshelfList) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompletedList.append(bookElement);
        }
        else {
            completedList.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;
    
    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Penulis : " + bookObject.author;
    
    const textYear = document.createElement('p');
    textYear.innerText = "Tahun : " + bookObject.year;
    
    const textContainer = document.createElement('article');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);
    
    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    
    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');
    
    if (bookObject.isComplete) {
        const blueButton1 = document.createElement('button');
        blueButton1.classList.add('blue');
        blueButton1.innerText = 'Belum selesai di Baca';
     
        blueButton1.addEventListener('click', function () {
            addToCompletedList(bookObject.id);
        });
     
        const redButton = document.createElement('button');
        redButton.classList.add('red');
        redButton.innerText = 'Hapus Buku';
     
        redButton.addEventListener('click', function () {
            bookIdToDelete = bookObject.id;
            showDeleteConfirmationDialog();
        });
     
        actionContainer.append(blueButton1, redButton);
    } 
    else {
        const blueButton2 = document.createElement('button');
        blueButton2.classList.add('blue');
        blueButton2.innerText = 'Selesai di Baca';
        
        blueButton2.addEventListener('click', function () {
            removeFromCompletedList(bookObject.id);
        });
        
        const redButton = document.createElement('button');
        redButton.classList.add('red');
        redButton.innerText = 'Hapus Buku';
     
        redButton.addEventListener('click', function () {
            bookIdToDelete = bookObject.id;
            showDeleteConfirmationDialog();
        });

        actionContainer.append(blueButton2, redButton);
    }
    container.append(actionContainer);
     
    return container;
}

function findBook(bookId) {
    for (const bookItem of incompleteBookshelfList) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in incompleteBookshelfList) {
        if (incompleteBookshelfList[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function addToCompletedList(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    alert('Buku berhasil dipindahkan ke rak Belum Selesai Dibaca!')
}

function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);
   
    if (bookTarget === -1) return;
   
    incompleteBookshelfList.splice(bookTarget, 1);
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeFromCompletedList (bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    alert('Buku berhasil dipindahkan ke rak Selesai Dibaca!')
}

/* ----- Bagian Local Storage ----- */

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "Bookshelf_Application";

function checkForStorage() {
    return typeof (Storage) !== 'undefined';
}

function saveData() {
    if (checkForStorage()) {
        const parsed = JSON.stringify(incompleteBookshelfList);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    
    if (data !== null) {
        for (const book of data) {
            incompleteBookshelfList.push(book);
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, () => {
    console.log("Siuuu, Data Aman!");
});

/* ----- Bagian Searching ----- */

const completeBookshelfList = [];

const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    searchBookByTitle(searchTitle, incompleteBookshelfList, document.getElementById('incompleteBookshelfList'));
    searchBookByTitle(searchTitle, completeBookshelfList, document.getElementById('completeBookshelfList'));
});

function searchBookByTitle(searchTitle, bookList, displayElement) {
    for (const bookItem of incompleteBookshelfList) {
        const bookTitle = bookItem.title.toLowerCase();
        const bookElement = document.getElementById(`book-${bookItem.id}`);
        if (bookTitle.includes(searchTitle)) {
            bookElement.style.display = "block";
        } 
        else {
            bookElement.style.display = "none";
        }
    }
}

/* ----- Bagian Custom Dialog ----- */

function showDeleteConfirmationDialog() {
    document.getElementById('deleteConfirmationDialog').style.display = 'block';
}
  
function hideDeleteConfirmationDialog() {
    bookIdToDelete = null;
    document.getElementById('deleteConfirmationDialog').style.display = 'none';
}
  
document.getElementById('confirmDeleteButton').addEventListener('click', function() {
    if (bookIdToDelete !== null) {
        deleteBook(bookIdToDelete);
    }
    hideDeleteConfirmationDialog();

    alert('Buku berhasil dihapus!')
});
  
document.getElementById('cancelDeleteButton').addEventListener('click', function() {
    bookIdToDelete = null;
    hideDeleteConfirmationDialog();
});