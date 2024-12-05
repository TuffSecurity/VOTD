const verseDisplay = document.getElementById("verseDisplayGma");
const grabBtn = document.getElementById("verseGrabGma");
const placeHolder = document.getElementById("disappear");
const bookMarkBtn = document.getElementById("bookMark");
const bookmarkIcon = document.getElementById('bookmarkIcon');
const bookMarkContainer = document.getElementById("bookMarkCont");
const bookMarkDisplay = document.getElementById("bookMarkContainer");
const showFormBtn = document.getElementById('showFormBtn');
const prayerForm = document.getElementById('prayerForm');
const prayerBtn = document.getElementById('prayerBtn');
const prayerTitle = document.getElementById('prayerTitle');
const prayerBody = document.getElementById('prayerContent');
const prayerArchiveDisplay = document.getElementById('archiveDisplay');
const prayerArchiveSection = document.getElementById('prayerArchiveSection');
const prayerBack = document.getElementById('prayerBack');
const submitPrayerBtn = document.getElementById('submitPrayerButton');
const backBtn = document.getElementById("back");
const API_BASE_URL = window.location.origin;
const updateVerse = (verse) => {
    placeHolder.style.display = "none";
    verseDisplay.innerHTML = verse;
    verseDisplay.style.opacity = 0;
    verseDisplay.style.animation = "none";
    setTimeout(() => {
        verseDisplay.style.animation = "fadeIn 1s ease forwards";
    }, 10);
};

const saveBookmark = async (text) => {
    bookMarkDisplay.innerHTML += `<div class="exampleBookMark">
                <p class="exampleVerse">
                    ${text}
                </p>
            </div>`;
            try{
                const res = await fetch(`${API_BASE_URL}/saveBookmark`, {
                   method: 'POST',
                   headers: {
                       'content-type': 'application/json',
                   },
                   body: JSON.stringify({ verse: text }),
                });
                if(!res.ok) {
                    throw new Error('Failed to save Bookmark');
                }
                console.log('bookmark saved successfully')
                alert('bookmark saved successfully');
            } catch(error) {
                console.log(error);
                alert("there was a data error");
            }
};

const loadBookmarks = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/getBookmarks`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        });
        
        if (!res.ok) {
            throw new Error('Failed to fetch bookmarks');
        }
        
        const data = await res.json();
        if (data.success) {
            displayBookmarks(data.bookmarks);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error("Error loading bookmarks:", error);
        alert("There was an error fetching bookmarks.");
    }
};

const displayBookmarks = (bookmarks) => {
    if (!bookmarks || bookmarks.length === 0) {
        bookMarkDisplay.innerHTML = "<p>No bookmarks available.</p>";
             return;
    }
    bookMarkDisplay.innerHTML = "";
    bookmarks.forEach(({ verse, date }) => {
        bookMarkDisplay.innerHTML += `<div class="exampleBookMark">
                <p class="exampleVerse">
                    ${verse}
                </p>
                <p class="date">${date}</p>
            </div>`;            
    });
};

const pullData = async () => {
    try {
        const req = await fetch('https://labs.bible.org/api/?passage=votd&formatting=para&type=json');
        const res = await req.json();
        const [{ bookname, chapter, verse, text }] = res;
        const verseText = `${bookname} ${chapter}:${verse}, ${text}`;
        updateVerse(verseText);
        bookmarkIcon.classList.add("visible");
        bookmarkIcon.addEventListener("click", () => saveBookmark(verseText));
    } catch (error) {
        console.log("There was a data error: ", error);
    }
};


//prayer archive section

const showFormFun = () => {
    prayerForm.style.display = 'flex';
};

const closeFormFun = () => {
    prayerForm.style.display = 'none';
};

const displayPrayer = (id, title, prayer) => {
    const newDiv = `
        <div class="prayerEntry">
            <h3>${title}</h3>
            <p>${prayer}</p>
            <small>${new Date().toLocaleString()}</small>
            <button class="delete-prayer-btn" data-id="${id}">Delete</button>
        </div>
    `;
    prayerArchiveDisplay.innerHTML += newDiv;

    // Add event listener for the delete button
    const deleteButton = prayerArchiveDisplay.querySelector(`[data-id="${id}"]`);
    deleteButton.addEventListener("click", () => deletePrayer(id, deleteButton.parentElement));
};

const loadPrayers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/getPrayers`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();

        if (response.ok && result.success) {
            const { prayers } = result;
            prayers.forEach(({ _id, prayerTitle, prayerBody }) => {
                displayPrayer(_id, prayerTitle, prayerBody);
            });
        } else {
            alert(result.message || "Failed to fetch prayers.");
        }
    } catch (error) {
        console.error("Error fetching prayers:", error);
        alert("An error occurred while fetching prayers.");
    }
};

const savePrayer = async () => {
    const titleValue = prayerTitle.value.trim();
    const bodyValue = prayerBody.value.trim();
    prayerForm.preventDefault();
    if (!titleValue || !bodyValue) {
        alert('There needs to be a title and content to submit');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/savePrayer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prayerTitle: titleValue, prayerBody: bodyValue }),
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert('Prayer saved successfully');
            const { _id, prayerTitle, prayerBody } = result.prayer;
            displayPrayer(_id, prayerTitle, prayerBody);
        } else {
            alert(result.message || "Failed to save prayer.");
        }
    } catch (error) {
        console.error("Error saving prayer:", error);
        alert("There was an error saving the prayer.");
    }
};

const deletePrayer = async (id, prayerElement) => {
    const confirmation = confirm("Are you sure you want to delete this prayer?");
    if (!confirmation) return;

    try {
        const response = await fetch(`${API_BASE_URL}/deletePrayer/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert("Prayer deleted successfully.");
            prayerElement.remove(); // Remove the element from the UI
        } else {
            alert(result.message || "Failed to delete prayer.");
        }
    } catch (error) {
        console.error("Error deleting prayer:", error);
        alert("An error occurred while deleting the prayer.");
    }
};

// all my event listeners
submitPrayerBtn.addEventListener('click', () => {
   savePrayer();
    closeFormFun();
});

backBtn.addEventListener("click", () => {
    bookMarkContainer.style.right = "-100%";
});

grabBtn.addEventListener("click", pullData);

bookMarkBtn.addEventListener("click", () => {
    bookMarkContainer.style.right = "0";
    loadBookmarks();
});

    prayerBtn.addEventListener('click', () => {
        prayerArchiveSection.classList.add('active');
        loadPrayers();
    });

    prayerBack.addEventListener('click', () => {
   prayerArchiveSection.classList.remove('active');
   closeFormFun();
    });
    showFormBtn.addEventListener('click', () => {
        showFormFun();
    });
