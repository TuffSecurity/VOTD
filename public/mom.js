const verseDisplay = document.getElementById("verseDisplay");
const grabBtn = document.getElementById("verseGrab");
const placeHolder = document.getElementById("disappear");
const bookmarkIcon = document.createElement("span");
bookmarkIcon.classList.add("hidden");
const API_BASE_URL = window.location.origin;

// Function to update the displayed verse
const updateVerse = (verse) => {
    placeHolder.style.display = "none";
    verseDisplay.innerHTML = verse;
    verseDisplay.style.display = "block";
    verseDisplay.style.opacity = 0;
    verseDisplay.style.animation = "none";
    setTimeout(() => {
        verseDisplay.style.animation = "fadeIn 1s ease forwards";
    }, 10);
};

// Function to fetch the verse of the day
const pullData = async () => {
    try {
        const req = await fetch('https://labs.bible.org/api/?passage=votd&formatting=para&type=json');
        const res = await req.json();
        const [{ bookname, chapter, verse, text }] = res;
        const verseText = `${bookname} ${chapter}:${verse}, ${text}`;
        updateVerse(verseText);

        // Show the bookmark icon and enable saving
        bookmarkIcon.classList.add("visible");
        bookmarkIcon.addEventListener("click", () => saveBookmark(verseText));
    } catch (error) {
        console.log("There was a data error: ", error);
    }
};

// Function to save a bookmark
const saveBookmark = async (text) => {
    try {
        const res = await fetch(`${API_BASE_URL}/saveMomBookmark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verse: text }),
        });

        if (!res.ok) {
            throw new Error('Failed to save Bookmark');
        }

        alert('Bookmark saved successfully');
    } catch (error) {
        console.log(error);
        alert("There was a data error while saving the bookmark.");
    }
};

// Function to load and display bookmarks
const loadBookmarks = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/getMomBookmarks`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
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

// Function to render bookmarks
const displayBookmarks = (bookmarks) => {
    const bookmarkContainer = document.getElementById("bookmarkContainer");
    if (!bookmarks || bookmarks.length === 0) {
        bookmarkContainer.innerHTML = "<p>No bookmarks available.</p>";
        return;
    }
    bookmarkContainer.innerHTML = "";
    bookmarks.forEach(({ verse, date }) => {
        bookmarkContainer.innerHTML += `<div class="exampleBookMark">
            <p class="exampleVerse">${verse}</p>
            <p class="date">${date}</p>
        </div>`;
    });
};

// Prayer-related functionalities
const showFormBtn = document.getElementById('showFormBtn');
const prayerForm = document.getElementById('prayerForm');
const prayerTitle = document.getElementById('prayerTitle');
const prayerBody = document.getElementById('prayerContent');
const prayerArchiveDisplay = document.getElementById('archiveDisplay');
const prayerArchiveSection = document.getElementById('prayerArchiveSection');
const prayerBack = document.getElementById('prayerBack');
const submitPrayerBtn = document.getElementById('submitPrayerButton');

// Show and hide the prayer form
const showFormFun = () => { prayerForm.style.display = 'flex'; };
const closeFormFun = () => { prayerForm.style.display = 'none'; };

// Display a prayer
const displayPrayer = (id, title, prayer) => {
    const prayerDiv = `
        <div class="prayerEntry">
            <h3>${title}</h3>
            <p>${prayer}</p>
            <small>${new Date().toLocaleString()}</small>
            <button class="delete-prayer-btn" data-id="${id}">Delete</button>
        </div>
    `;
    prayerArchiveDisplay.innerHTML += prayerDiv;

    // Add event listener to the delete button
    const deleteButton = prayerArchiveDisplay.querySelector(`[data-id="${id}"]`);
    deleteButton.addEventListener("click", () => deletePrayer(id, deleteButton.parentElement));
};

// Fetch prayers from the server
const loadPrayers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/getMomPrayers`, {
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

// Save a prayer to the server
const savePrayer = async () => {
    const titleValue = prayerTitle.value.trim();
    const bodyValue = prayerBody.value.trim();

    if (!titleValue || !bodyValue) {
        alert('There needs to be a title and content to submit');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/saveMomPrayer`, {
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

// Delete a prayer
const deletePrayer = async (id, prayerElement) => {
    const confirmation = confirm("Are you sure you want to delete this prayer?");
    if (!confirmation) return;

    try {
        const response = await fetch(`${API_BASE_URL}/deleteMomPrayer/${id}`, {
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

// Event Listeners
grabBtn.addEventListener("click", pullData);
submitPrayerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    savePrayer();
    closeFormFun();
});
showFormBtn.addEventListener('click', showFormFun);
prayerBack.addEventListener('click', () => {
    prayerArchiveSection.classList.remove('active');
    closeFormFun();
});

// Load bookmarks or prayers on their respective actions
document.getElementById('bookMark').addEventListener("click", loadBookmarks);
document.getElementById('prayerBtn').addEventListener("click", () => {
    prayerArchiveSection.classList.add("active");
    loadPrayers();
});
