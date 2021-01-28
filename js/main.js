class PasswordGenerator {
  constructor() {
    this.options = {
      numWords: 4,
      doCapitalize: true,
      separator: "",
      // TODO: profanity checkbox?
    };

    this.currentPassword = "blankpassword";

    // bind UI references
    this.passwordBox = document.getElementById("pw-text");
    this.generateButton = document.getElementById("pw-generate");

    this.generateButton.addEventListener("click", (evt) =>
      this.generateNewPassword(evt)
    );

    this.passwordBox.value = this.currentPassword;

    this.loadWordListFromFile().then(() => this.generateNewPassword());
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
    const wordsForPassword = this.options.numWords;
    for (let i = 0; i < wordsForPassword; i++) {
      // choose a uniformly distributed random number between 0 and
      const randomNum = this.uniformlyDistributedRandom(
        0,
        this.allWords.length
      );
      chosenWords.push(this.allWords[randomNum]);
    }

    console.log(chosenWords);

    // join all chosenWords with a separator
    const newPassword = chosenWords.reduce((acc, word) => {
      word = this.options.doCapitalize
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word;
      return acc + word;
    }, "");

    // update the input box
    this.passwordBox.value = newPassword;

  }

  uniformlyDistributedRandom(lower, upper) {
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
