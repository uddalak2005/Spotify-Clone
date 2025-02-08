async function getSongs(folder) {
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let lis = div.getElementsByTagName("li");
    let songs = [];
    for (let i = 1; i < lis.length; i++) {
        console.log(lis[i].getElementsByTagName("a")[0].href.split("/").pop());
        songs.push({
            href: lis[i].getElementsByTagName("a")[0].href,
            name: lis[i].innerText.split(".")[0]
        });

    }
    return songs;

}


async function getPlayList() {
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let lis = div.getElementsByTagName("li");
    let playlist = [];
    for (let i = 1; i < lis.length; i++) {
        playlist.push(lis[i].getElementsByTagName("a")[0].href.split("/").pop());

    }
    return playlist;
}

let currentAudio = null;

const playMusic = (track, folder) => {
    // Pause the previously playing audio if exists

    let thumb = document.querySelector(".circle");
    let currentTime = document.getElementById("currentTime");
    let endTime = document.getElementById("endTime");

    currentTime.innerText = "";
    endTime.innerText = "00:00";

    let play = document.getElementById("playPause");

    if (currentAudio) {
        currentAudio.pause();
        play.src = "./assets/pause.svg"
    }

    // Create a new audio instance and store it

    currentAudio = new Audio(`/songs/${folder}/` + track + ".m4a");
    play.src = "./assets/pausePlay.svg";
    // Play the new song
    currentAudio.play();
    console.log(currentAudio);
    console.log(currentAudio.src.split("/").slice(-1)[0]);

    let footerTitle = document.getElementById("footerTitle");
    let footerArtist = document.getElementById("footerArtist");


    footerTitle.innerText = track;
    footerArtist.innerText = "Unknown Artist";


    currentAudio.addEventListener("timeupdate", () => {
        let minutes = Math.floor(currentAudio.currentTime / 60);
        let seconds = Math.floor(currentAudio.currentTime % 60);

        currentTime.innerText = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
        endTime.innerText = Math.floor(currentAudio.duration / 60) + ":" + (Math.floor(currentAudio.duration % 60) < 10 ? "0" + Math.floor(currentAudio.duration % 60) : Math.floor(currentAudio.duration % 60));

        document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
        document.querySelector(".elapsed").style.width = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";

    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let offsetPercent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = offsetPercent + "%";
        document.querySelector(".elapsed").style.width = offsetPercent + "%"
        currentAudio.currentTime = (offsetPercent * currentAudio.duration) / 100;
        document.querySelector("#currentTime").innerText = (offsetPercent * currentAudio.duration) / 100;
    });

    let isDragging = false;

    thumb.addEventListener("mousedown", () => {
        isDragging = true;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    document.addEventListener("mousemove", (event) => {
        if (isDragging && currentAudio) {
            let seekbarRect = seekbar.getBoundingClientRect();
            let newTime = ((event.clientX - seekbarRect.left) / seekbarRect.width) * currentAudio.duration;
            currentAudio.currentTime = Math.min(Math.max(newTime, 0), currentAudio.duration);
        }
    });



};


async function enlistSongs(playlist) {
    let list = document.querySelector(".left");

    for (const folder of playlist) {  // Use for...of to properly await each folder's songs
        let songs = await getSongs(folder);  // Ensure folder is properly defined
        songs.forEach((element) => {
            let listCard = `<div class="list">
                <div class="songCard">
                    <div style="display: flex; align-items: center; gap: 10px">
                        <img src="https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/radio/artist/0oOet2f43PA68X5RxKobEy/en"
                            alt="" style="height: 40px; width: 40px">
                        <div>
                            <p class="title"
                                style="font-size: 15px; margin: 0px; font-family: Poppins, serif;font-weight: 600; color:white">
                                ${element.name}</p>
                            <p class="sub"
                                style=" font-family: Poppins, serif;color: grey; margin: 0px;font-size: 10px">${folder}</p>
                        </div>
                    </div>
                    <div style="display: flex; height: 50%; gap:5px">
                        <p class="title" style="color: white; font-family: Poppins, serif; font-weight: 600; font-size: smaller;">Play</p>
                        <img src="./assets/pause.svg" alt="" class="icons">
                    </div>
                </div>
            </div>`;

            list.insertAdjacentHTML("beforeend", listCard);
        });
    }
}

async function enlistPlayList(playlist){
    let Area = document.querySelector(".playlists");
    playlist.forEach(e=>{
        let card = `<div class="card">
                    <div class="playButton">
                        <img src="./assets/play.svg" alt="" style="height: 50px">
                    </div>
                    <div class="poster">
                        <img class="posterImg"
                            src="https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/radio/artist/0oOet2f43PA68X5RxKobEy/en"
                            alt="">
                    </div>
                    <div class="description">
                        <p class="title"
                            style="font-size: 24px; margin: 0px; font-family: Poppins, serif;font-weight: 600">Title</p>
                        <p class="sub" style=" font-family: Poppins, serif;color: grey; margin: 0px;">This is subtitle
                        </p>
                    </div>
                </div>`
                Area.insertAdjacentHTML("beforeend", card);
    })
}

async function main() {
    let playlist = await getPlayList();
    console.log(playlist);

    await enlistPlayList(playlist);


    await enlistSongs(playlist)

    /*The issue is that event listeners are being attached before the playlist elements are actually added to the DOM when calling enlistSongs(playlist) inside main().

    Why It Works Inside main()
    When the entire playlist processing is inside main(), elements are added before attaching event listeners.

    Why It Doesn't Work When enlistSongs(playlist) is Separate
    The function enlistSongs(playlist) runs asynchronously and modifies the DOM.
    Event listeners are attached immediately after calling enlistSongs(playlist), before the songs are added.
    This means document.querySelectorAll(".songCard") runs before .songCard elements exist in the DOM.*/


    // Attach event listeners after dynamically adding elements
    document.querySelectorAll(".songCard").forEach(e => {
        console.log();
        e.addEventListener("click", (event) => {
            let songName = e.getElementsByTagName("p")[0].innerText.trim();
            let folderName = e.getElementsByTagName("p")[1].innerText.trim()
            console.log(songName);
            playMusic(songName, folderName);
        });
    });

    let play = document.getElementById("playPause");
    play.addEventListener("click", (event) => {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                play.src = "./assets/pausePlay.svg"
            }
            else {
                currentAudio.pause();
                play.src = "./assets/pause.svg"
            }
        }

    });







    let index = 0;  // ✅ Store current song index

    // Function to update current index
    const updateIndex = () => {
        let currentSongName = currentAudio.src.split("/").pop().split(".")[0]; // Extract song name
        songs.forEach((e, i) => {
            if (e.name === currentAudio.src.split("/").pop().split(".")[0]) {
                index = i;
            }
        })
    };



    next.addEventListener("click", () => {
        if (currentAudio) {
            updateIndex(); // ✅ Update index before playing the next song

            if (index === songs.length - 1) {
                index = 0; // ✅ Loop to the first song
            } else {
                index++;
            }

            playMusic(songs[index].name); // ✅ Play the next song
        }
    });

    prev.addEventListener("click", () => {
        if (currentAudio) {
            updateIndex(); // ✅ Update index before playing the previous song

            if (index === 0) {
                index = songs.length - 1; // ✅ Loop to the last song
            } else {
                index--;
            }

            playMusic(songs[index].name); // ✅ Play the previous song
        }
    });

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentAudio.volume = parseInt(e.target.value) / 100;
    })
}



main()