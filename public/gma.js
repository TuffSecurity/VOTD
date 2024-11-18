const verseDisplay = document.getElementById("verseDisplayGma");
const grabBtn = document.getElementById("verseGrabGma");
const placeHolder = document.getElementById("disappear");
const bookMarkBtn = document.getElementById("bookMark");
const bookMarkContainer = document.getElementById("bookMarkCont");
const backBtn = document.getElementById("back");
const updateVerse = (verse) => {
    placeHolder.style.display = "none";
    verseDisplay.innerHTML = verse;
    verseDisplay.style.opacity = 0;
    verseDisplay.style.animation = "none";
    setTimeout(() => {
        verseDisplay.style.animation = "fadeIn 1s ease forwards";
    }, 10);
};

const pullData = async () => {
    try{
        const req = await fetch('https://labs.bible.org/api/?passage=votd&formatting=para&type=json');
    const res = await req.json();
    const [{ bookname, chapter, verse, text }] = res;
    const verseText = `${bookname} ${chapter}:${verse}, ${text}`;
    updateVerse(verseText);
    
    } catch(error) {
        console.log("There was a data error: ", error)
    }
};
backBtn.addEventListener("click", () => {
    bookMarkContainer.style.right = "-100%";
});

grabBtn.addEventListener("click", pullData);
bookMarkBtn.addEventListener("click", () => {
    bookMarkContainer.style.right = "0";
});