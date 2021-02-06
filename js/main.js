class PasswordGenerator {
  constructor() {
    this.optionRefs = {};
    this.bindUiRefs();
    this.loadOptions();
    this.generateButton.addEventListener("click", (evt) =>
      this.generateNewPassword(evt)
    );

    this.loadWordListFromFile().then(() => this.generateNewPassword());
  }

  saveOptions() {
    // if saveOptions is false, delete localStorage and return early
    if (this.optionRefs.saveOptions.checked === false) {
      window.localStorage.clear();
      return;
    }

    // TODO: save the fact that save is enabled

    // save options to localStorage
    for (const [key, val] of Object.entries(this.options)) {
      window.localStorage.setItem(key, val);
    }
  }

  loadOptions() {
    // if nothing is saved, use defaults:
    this.options = {
      doUppercase: true,
      separators: [""],
      addRandomEndNumber: true,
    };

    // try to load from localStorage
    for (const [key, val] of Object.entries(this.options)) {
      let valFromStorage = window.localStorage.getItem(key);
      if (valFromStorage != null) {
        if (typeof this.options[key] === "boolean") {
          this.options[key] = valFromStorage === "true";
        } else if (Array.isArray(this.options[key])) {
          this.options[key] = valFromStorage.split(",");
        }
      }
    }
    // fix up separators
    if (window.localStorage.getItem("separators").includes(",,")) {
      this.options.separators.push(",");
      this.options.separators = this.options.separators.filter(
        (i) => i !== ""
      );
    }

    // TODO: update UI elements based on options
  }

  bindUiRefs() {
    // Options that should be saved
    this.optionRefs.minWords = document.getElementById("pw-min-words");
    this.optionRefs.minLength = document.getElementById("pw-min-length");
    this.optionRefs.separators = document.getElementById("pw-separators");
    this.optionRefs.doUppercase = document.getElementById("pw-uppercase");
    this.optionRefs.addEndNum = document.getElementById("pw-end-num");
    this.optionRefs.saveOptions = document.getElementById("pw-save-options");

    // Other UI refs
    this.passwordBox = document.getElementById("pw-text");
    this.generateButton = document.getElementById("pw-generate");
    this.copyButton = document.getElementById("pw-copy");

    // bind event listeners
    this.optionRefs.separators.oninput = (evt) => this.updateSeparators(evt);
  }

  updateSeparators(evt) {
    // remove duplicates and store as an array
    const sepSet = new Set(evt.target.value);
    this.options.separators = Array.from(sepSet);

    // update inputbox with actual separators used
    const displaySeps = this.options.separators.join("");
    this.optionRefs.separators.value = displaySeps;

    // save options if appropriate
    this.saveOptions();
  }

  async loadWordListFromFile() {
    this.allWords = await fetch("../data/wordlist.txt")
      .then((response) => response.text())
      .then((data) => {
        const word_list = data.split(",");
        return word_list;
      });
  }

  generateNewPassword(evt) {
    let chosenWords = [];
    const wordsForPassword = this.optionRefs.minWords.value;
    for (let i = 0; i < wordsForPassword; i++) {
      // choose a uniformly distributed random number between 0 and
      const randomNum = this.getRand(0, this.allWords.length);
      chosenWords.push(this.allWords[randomNum]);
    }

    let newPassword = chosenWords.reduce((acc, word) => {
      word = this.optionRefs.doUppercase.checked
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word;

      const sepNum = this.getRand(0, this.options.separators.length);
      let sep = this.options.separators[sepNum];
      return acc + word + sep;
    }, "");
    newPassword = newPassword.slice(0, -1);

    // TODO: check if minLength is met and add another word if not
    // add in one extra length if addEndNum is true
    const isTooShort = (password) => {
      const additionalChars = this.optionRefs.addEndNum.checked ? 1 : 0;
      const foundLen = password.length + additionalChars;

      return foundLen < this.optionRefs.minLength.value;
    };

    while (isTooShort(newPassword)) {
      const randomNum = this.getRand(0, this.allWords.length);
      let nextWord = this.allWords[randomNum];
      if (this.optionRefs.doUppercase.checked) {
        nextWord = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
      }
      newPassword += nextWord;
    }

    if (this.optionRefs.addEndNum.checked) {
      newPassword += this.getRand(0, 10);
    }

    // update the input box
    this.passwordBox.value = newPassword;
  }

  getRand(lower, upper) {
    const difference = upper - lower;
    const RAND_MAX = Math.pow(2, 32);
    const maxAllowableRandom = RAND_MAX - (RAND_MAX % difference);
    const randValues = new Uint32Array(1);

    do {
      window.crypto.getRandomValues(randValues);
    } while (randValues[0] >= maxAllowableRandom);

    randValues[0] %= difference;

    return lower + randValues[0];
  }
}

window.PasswordGenerator = new PasswordGenerator();
