const verseDisplay = document.getElementById("verseDisplay");
const grabBtn = document.getElementById("verseGrab");
const placeHolder = document.getElementById("disappear");
const bookmarkIcon = document.getElementById("bookmarkIcon");
const bookMarkTab = document.getElementById("bookMark");
const prayerTab = document.getElementById("prayerBtn");
const bookMarkSection = document.getElementById("bookMarkCont");
const prayerArchiveSection = document.getElementById("prayerArchiveSection");
const backBookMark = document.getElementById("backBookMark");
const prayerBack = document.getElementById("prayerBack");
const prayerForm = document.getElementById("prayerForm");
const showFormBtn = document.getElementById("showFormBtn");
const submitPrayerBtn = document.getElementById("submitPrayerButton");
const prayerArchiveDisplay = document.getElementById("archiveDisplay");
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

        if (!res.ok) throw new Error('Failed to save Bookmark');

        alert('Bookmark saved successfully');
    } catch (error) {
        console.error("Error saving bookmark:", error);
        alert("There was a data error while saving the bookmark.");
    }
};

// Function to load prayers
const loadPrayers = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/getMomPrayers`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const { success, prayers } = await res.json();

        if (success) {
            prayerArchiveDisplay.innerHTML = ""; // Clear existing prayers
            prayers.forEach(({ _id, prayerTitle, prayerBody }) => {
                displayPrayer(_id, prayerTitle, prayerBody);
            });
        } else {
            prayerArchiveDisplay.innerHTML = "<p>No prayers available.</p>";
        }
    } catch (error) {
        console.error("Error loading prayers:", error);
        prayerArchiveDisplay.innerHTML = "<p>Error loading prayers.</p>";
    }
};

// Function to display a prayer
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
};

// Event delegation for delete buttons
prayerArchiveDisplay.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-prayer-btn")) {
        const id = event.target.getAttribute("data-id");
        const prayerElement = event.target.parentElement;
        deleteMomPrayer(id, prayerElement);
    }
});

// Function to delete a prayer
const deleteMomPrayer = async (id, prayerElement) => {
    const confirmation = confirm("Are you sure you want to delete this prayer?");
    if (!confirmation) return;

    try {
        const res = await fetch(`${API_BASE_URL}/deleteMomPrayer/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        const { success } = await res.json();
        if (success) {
            prayerElement.remove();
            alert("Prayer deleted successfully.");
        } else {
            alert("Failed to delete prayer.");
        }
    } catch (error) {
        console.error("Error deleting prayer:", error);
        alert("An error occurred while deleting the prayer.");
    }
};

// Function to save a prayer
const savePrayer = async () => {
    const prayerTitleInput = document.getElementById("prayerTitle");
    const prayerContentInput = document.getElementById("prayerContent");
    const titleValue = prayerTitleInput.value.trim();
    const bodyValue = prayerContentInput.value.trim();

    if (!titleValue || !bodyValue) {
        alert("Title and prayer content are required!");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/saveMomPrayer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prayerTitle: titleValue, prayerBody: bodyValue }),
        });

        const { success, prayer } = await res.json();
        if (success) {
            displayPrayer(prayer._id, prayer.prayerTitle, prayer.prayerBody);
            alert("Prayer saved successfully!");
            prayerTitleInput.value = "";
            prayerContentInput.value = "";
        } else {
            alert("Failed to save prayer.");
        }
    } catch (error) {
        console.error("Error saving prayer:", error);
        alert("An error occurred while saving the prayer.");
    }
};

// Event Listeners
submitPrayerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    savePrayer();
});

prayerTab.addEventListener("click", () => {
    prayerArchiveSection.classList.add("active");
    loadPrayers();
});

prayerBack.addEventListener("click", () => {
    prayerArchiveSection.classList.remove("active");
});

showFormBtn.addEventListener("click", () => {
    prayerForm.style.display = 'flex';
});

grabBtn.addEventListener("click", pullData);
