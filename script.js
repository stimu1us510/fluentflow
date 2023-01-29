const wikiText = document.getElementById('wiki-text')
const outputText = document.getElementById('output-text')

document.getElementById('wiki-image') ? document.getElementById('wiki-image').classList.add("d-none") : document.getElementById('wiki-image').classList.remove("d-none")

let levelsToHighlight = []
//let currentPageId = ""
let currentWikiText = ""

function highlightCefrWords(textInput, arrayWithMatches, outputElement) {
  // arrayWithMatches needs key called "words" with the value as an array of words
  const textWords = textInput.split(' ')
  for (let i = 0; i < textWords.length; i++) {
    for (let j = 0; j < arrayWithMatches.length; j++) {
      if (arrayWithMatches[j].words.includes(textWords[i].toLowerCase()) && levelsToHighlight.includes(arrayWithMatches[j].level) 
      //|| arrayWithMatches[j].words.includes(textWords[i].toLowerCase()) && levelsToHighlight.length == false
      ) {
        console.log(textWords[i])
        console.log(arrayWithMatches[j].translation[arrayWithMatches[j].words.indexOf(textWords[i].toLowerCase())])
        //console.log(arrayWithMatches[j].translation.indexOf(textWords[i].toLowerCase()))
        textWords[i] = `<span class="${arrayWithMatches[j].className}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"data-bs-title="${arrayWithMatches[j].translation[arrayWithMatches[j].words.indexOf(textWords[i].toLowerCase())]}">${textWords[i]}</span>`

        break
      }
    }
  }
  const highlightedText = textWords.join(' ').replace(/\n/g, '<br><br>')
  outputElement.innerHTML = highlightedText.trim()
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  document.getElementById("show-levels-toggle").classList.remove("disabled")
}

async function searchWikipedia(query) {
  const endpoint = 'https://en.wikipedia.org/w/api.php';
  const params = {
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: query,
    formatversion: 2,
    utf8: 1,
    origin: '*'
  };
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${endpoint}?${queryString}`);
  const data = await response.json();
  return data;
}

async function getWikipediaArticle(pageid) {
  const endpoint = 'https://en.wikipedia.org/w/api.php';
  const params = {
    action: 'query',
    format: 'json',
    pageids: pageid,
    prop: 'extracts|pageimages',
    piprop: 'original',
    utf8: 1,
    origin: '*',
    formatversion: 2,
    exintro: 1,
    explaintext: 1
  };
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${endpoint}?${queryString}`);
  const data = await response.json();
  console.log(data)
  return data;
}

function getSearchResults() {
  searchTerm = document.getElementById("search-box").value
  document.getElementById('wiki-image').classList.add("d-none")

  searchWikipedia(searchTerm).then(results => {
    const pageid = results.query.search[0].pageid;
    //currentPageId = pageid
    console.log(pageid)
    return getWikipediaArticle(pageid);
  }).then(article => {
    const articleText = article.query.pages[0].extract
    currentWikiText = articleText
    if (article.query.pages[0].original?.source || 'default value') document.getElementById('wiki-image').src = article.query.pages[0].original?.source
    article.query.pages[0].original?.source ? document.getElementById('wiki-image').classList.remove("d-none") : document.getElementById('wiki-image').classList.add("d-none") 

    highlightCefrWords(articleText, cefrWords, outputText)

  })
}

// function getImage(extract) {
//   var imageUrl;
//   var imageRegex = /(https?:\/\/.*\.(?:png|jpg))/i;
//   var imageMatch = extract.match(imageRegex);
//   if (imageMatch) {
//     imageUrl = imageMatch[0];
//   }
//   return imageUrl;
// }

function searchFormSubmit(event) {
  event.preventDefault(); // prevent the form from being submitted
  console.log("form submitted");
  getSearchResults()
}

// function stt() {
//   if (!('speechSynthesis' in window)) return console.warn("speech-to-text unavailable")
//   const utterance = new SpeechSynthesisUtterance();
//   console.log("stt started")
//   utterance.text = currentWikiText
//   const voices = window.speechSynthesis.getVoices()
//   utterance.voice = voices[0] // use the first voice in the list
//   speechSynthesis.speak(utterance)
// }

//let utterance

function stt() {
  if (!('speechSynthesis' in window)) return console.warn("speech-to-text unavailable")
  if (!currentWikiText) return console.warn("speech-to-text error: no text found")

  // const textElement = document.getElementById('output-text');
  // const text = textElement.textContent;

  let utterance = new SpeechSynthesisUtterance(currentWikiText)
  speechSynthesis.speak(utterance);
  const voices = window.speechSynthesis.getVoices()
  utterance.voice = voices[0]
  
  console.log(utterance);

  utterance.onboundary = function(event) {
    console.log('Boundary reached:', event.charIndex);
  }

  
  // utterance.cancel()
  // //speechSynthesis.cancel
  // const utterance = new SpeechSynthesisUtterance();
  // console.log("stt started")
  // utterance.text = currentWikiText;
  // const voices = window.speechSynthesis.getVoices();
  // utterance.voice = voices[0]; // use the first voice in the list

  // speechSynthesis.speak(utterance);
  
  
  // // Set up the onboundary event
  // utterance.onboundary = e => {
  //   // e.charIndex is the index of the character that marks the boundary
  //   const word = utterance.text.slice(e.charIndex, e.charIndex + e.length);
  //   console.log(`Speaking word: ${SpeechSynthesisUtterance.text}`);
    
  //   //console.log(`Speaking word: ${word}`);
    
  //   // Now you can use JavaScript to highlight the word being spoken
  //   // For example:
  //   //highlightWord(word);
  // };
  
  // speechSynthesis.speak(utterance);
  setInterval(() => { speechSynthesis.pause(); speechSynthesis.resume(); }, 5000);
}

function getWordBoundary(text, index) {
  // Find the start index of the current word
  let startIndex = index;
  while (startIndex > 0 && !text[startIndex].match(/\s/)) {
    startIndex--;
  }
  if (text[startIndex].match(/\s/)) {
    startIndex++;
  }
  
  // Find the end index of the current word
  let endIndex = index;
  while (endIndex < text.length && !text[endIndex].match(/\s/)) {
    endIndex++;
  }
  
  return { start: startIndex, end: endIndex };
}

function setLevelFilter(event) {
  console.log("filter button clicked")
  console.log(event.currentTarget.value)
  const value = event.currentTarget.value
  if(levelsToHighlight.includes(value)) {
    levelsToHighlight.splice(levelsToHighlight.indexOf(value),1)
    event.currentTarget.classList.remove('active')
    event.currentTarget.blur()
  } else {
    levelsToHighlight.push(value)
    event.currentTarget.classList.add('active')
  }
  console.log(levelsToHighlight)


  highlightCefrWords(currentWikiText, cefrWords, outputText)
  
}


document.getElementById("search-box").addEventListener("focus", () => {
  console.log("search clicked")
  document.getElementById("search-button").classList.add("btn-dark", "text-white")
})
document.getElementById("search-box").addEventListener("focusout", () => {
  console.log("search clicked")
  document.getElementById("search-button").classList.remove("btn-dark", "text-white")
})






document.getElementById("search-form").addEventListener("submit", searchFormSubmit)
document.getElementById("search-button").addEventListener("click", searchFormSubmit)
document.getElementById("read-text-button").addEventListener("click", stt)
document.getElementById("level-button-group").querySelectorAll('.btn').forEach(e => e.addEventListener("click", setLevelFilter))


const allSentencesUrl = 'http://172.105.224.70/api/collections/sentences/records'
let allSentencesFilters = `?filter=points~'2' && grammar='grammar B'`

fetch(allSentencesUrl+allSentencesFilters)
  .then(response => response.json())
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    // Handle any errors that occur
  });


const getCollectionOfSentencesUrl = 'http://172.105.224.70/api/collections/collections_sentences/records'
let getCollectionOfSentencesFilter = `?expand=fk_collections`
  fetch(getCollectionOfSentencesUrl+getCollectionOfSentencesFilter)
  .then(response => response.json())
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    // Handle any errors that occur
  });




  