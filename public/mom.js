// Element References
const verseDisplay = document.getElementById("verseDisplay");
const grabBtn = document.getElementById("verseGrab");
const placeHolder = document.getElementById("disappear");
const bookmarkIcon = document.getElementById("bookmarkIcon");
bookmarkIcon.classList.add("hidden");
const API_BASE_URL = window.location.origin;
const bookMarkTab = document.getElementById("bookMark");
const prayerTab = document.getElementById("prayerBtn");
const bookMarkSection = document.getElementById("bookMarkCont");
const prayerArchiveSection = document.getElementById("prayerArchiveSection");
const backBookMark = document.getElementById("backBookMark");
const prayerBack = document.getElementById("prayerBack");

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
        bookmarkIcon.addEventListener("click", () => saveMomBookmark(verseText));
    } catch (error) {
        console.log("There was a data error: ", error);
    }
};

// Function to save a bookmark
const saveMomBookmark = async (text) => {
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
const loadMomBookmarks = async () => {
    const bookMarkContainer = document.getElementById("bookMarkContainer");
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
            displayMomBookmarks(data.bookmarks);
        } else {
            bookMarkContainer.innerHTML = "<p>No bookmarks available.</p>";
        }
    } catch (error) {
        console.error("Error loading bookmarks:", error);
        bookMarkContainer.innerHTML = "<p>Error loading bookmarks.</p>";
    }
};

// Function to render bookmarks
const displayMomBookmarks = (bookmarks) => {
    const bookMarkContainer = document.getElementById("bookMarkContainer");
    bookMarkContainer.innerHTML = "";
    bookmarks.forEach(({ verse, date }) => {
        bookMarkContainer.innerHTML += `
            <div class="exampleBookMark">
                <p class="exampleVerse">${verse}</p>
                <p class="date">${date}</p>
            </div>`;
    });
};

// Function to load prayers
const loadPrayers = async () => {
    const archiveDisplay = document.getElementById("archiveDisplay");
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
            archiveDisplay.innerHTML = "<p>No prayers available.</p>";
        }
    } catch (error) {
        console.error("Error loading prayers:", error);
        archiveDisplay.innerHTML = "<p>Error loading prayers.</p>";
    }
};

// Function to display a prayer
const displayPrayer = (id, title, prayer) => {
    const archiveDisplay = document.getElementById("archiveDisplay");
    const prayerDiv = `
        <div class="prayerEntry">
            <h3>${title}</h3>
            <p>${prayer}</p>
            <small>${new Date().toLocaleString()}</small>
            <button class="delete-prayer-btn" data-id="${id}">Delete</button>
        </div>
    `;
    archiveDisplay.innerHTML += prayerDiv;

    // Add event listener to the delete button
    const deleteButton = archiveDisplay.querySelector(`[data-id="${id}"]`);
    deleteButton.addEventListener("click", () => deleteMomPrayer(id, deleteButton.parentElement));
};

// Function to delete a prayer
const deleteMomPrayer = async (id, prayerElement) => {
    const confirmation = confirm("Are you sure you want to delete this prayer?");
    if (!confirmation) return;

    try {
        const response = await fetch(`${API_BASE_URL}/deleteMomPrayer/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            alert("Prayer deleted successfully.");
            prayerElement.remove();
        } else {
            alert("Failed to delete prayer.");
        }
    } catch (error) {
        console.error("Error deleting prayer:", error);
        alert("An error occurred while deleting the prayer.");
    }
};

// Show and hide sections with animations
const showSection = (section) => section.classList.add("active");
const hideSections = () => {
    bookMarkSection.classList.remove("active");
    prayerArchiveSection.classList.remove("active");
};

// Event Listeners for Navigation Tabs
bookMarkTab.addEventListener("click", () => {
    showSection(bookMarkSection);
    loadMomBookmarks();
});

prayerTab.addEventListener("click", () => {
    showSection(prayerArchiveSection);
    loadPrayers();
});

backBookMark.addEventListener("click", hideSections);
prayerBack.addEventListener("click", hideSections);

// Prayer Form Functionality
const prayerForm = document.getElementById("prayerForm");
const showFormBtn = document.getElementById("showFormBtn");
const submitPrayerBtn = document.getElementById("submitPrayerButton");

const showFormFun = () => { prayerForm.style.display = 'flex'; };
const closeFormFun = () => { prayerForm.style.display = 'none'; };

showFormBtn.addEventListener("click", showFormFun);
submitPrayerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    savePrayer();
    closeFormFun();
});

// Save a prayer
const savePrayer = async () => {
    const prayerTitle = document.getElementById("prayerTitle").value.trim();
    const prayerContent = document.getElementById("prayerContent").value.trim();

    if (!prayerTitle || !prayerContent) {
        alert("Title and prayer content are required!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/saveMomPrayer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prayerTitle, prayerBody: prayerContent }),
        });

        if (response.ok) {
            alert("Prayer saved successfully!");
            const result = await response.json();
            displayPrayer(result._id, result.prayerTitle, result.prayerBody);
        } else {
            alert("Failed to save prayer.");
        }
    } catch (error) {
        console.error("Error saving prayer:", error);
        alert("An error occurred while saving the prayer.");
    }
};

// Fetch the verse of the day on button click
grabBtn.addEventListener("click", pullData);
