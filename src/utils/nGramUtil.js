const hashTextArray = (arr) => {
  // this function takes a list of strings and processes them into one string that can be hashed
  // into a hash table
  const str = arr.reduce((previousValue, currentValue) => `${previousValue}_${currentValue.toLowerCase()}`, '');
  return str;
};

const findNGrams = ({ size = 3, sourceTexts = [], text }) => {
  /*
        number: <Integer>, specifys what size nGram to use
        sourceTexts: <Array>[Objects]
            item: <Object> {
                text: <Array>[Strings], generated from the processed tokens when doing text analysis
                slug: <String>, unique string that identifies the source text in the AS4 database
            }
        text: <Array>[Strings], generated from the processed tokens when doing text analysis on
            student compositions
    */

  const textDefaultSlug = 'user_text_slug';
  const texts = sourceTexts.concat({ text, slug: textDefaultSlug });
  let userTextData = {};
  // we need to generate the data structure from the source text that will be used to find nGrams
  const sourceTextsData = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const item of texts) {
    const obj = {
      // this is a dictionary whose keys are unique hashings of nGrams and values is an array
      // of indexes that this nGram Hash exists at in the text
      nGramHashToIndexes: {},
      // this is the reverse mapping of the 'nGramHashToIndexes' dictionary which will help the run
      // time of the algorithm
      indexToNGramHash: {},
      nGramMatchIndexesInUserTextData: [],
      // object keys will be numbers corresponding to the size of the nGram and each value will be
      // an array of numbers corresponding to the start index of each nGram found larger than the
      // default 'size' of the nGrams we were initially looking for
      largerSizedNGramMatches: {},
    };
    const userText = item.slug === textDefaultSlug;
    for (let i = 0; i < item.text.length - size + 1; i += 1) {
      const nGramHash = hashTextArray(item.text.slice(i, i + size));
      if (obj.nGramHashToIndexes[nGramHash]) {
        obj.nGramHashToIndexes[nGramHash].push(i);
      } else {
        obj.nGramHashToIndexes[nGramHash] = i;
      }

      obj.indexToNGramHash[i] = nGramHash;

      if (userText) {
        // if its the userText were working with, while we are hashing it we will check if these
        // nGramHashes exist in any of the the other texts. If they do we will added them to the
        // list of 'nGramMatchIndexesInUserTextData' array
        // eslint-disable-next-line no-restricted-syntax
        for (const [slug, { nGramHashToIndexes }] of Object.entries(sourceTextsData)) {
          if (nGramHashToIndexes[nGramHash]) {
            sourceTextsData[slug].nGramMatchIndexesInUserTextData.push(i);
          }
        }
      }
    }

    if (userText) {
      // this means that this is the users text so we will save the data to userTextData
      userTextData = obj;
    } else {
      sourceTextsData[item.slug] = obj;
    }
  }

  // the next thing we need to do is cacluate larger sized nGrams that may exist in the set of
  // matchingNGrams
  // eslint-disable-next-line no-restricted-syntax
  for (const [slug, { nGramMatchIndexesInUserTextData }] of Object.entries(sourceTextsData)) {
    let startIndex;
    let prevIndex;
    // eslint-disable-next-line no-restricted-syntax
    for (const nGramMatchIndex of nGramMatchIndexesInUserTextData) {
      if (prevIndex === undefined || startIndex === undefined) {
        prevIndex = nGramMatchIndex;
        startIndex = nGramMatchIndex;
      } else if (prevIndex + 1 === nGramMatchIndex) {
        // this means that we are incrementing this nGram. so if initially it was a trigram now
        // its a quadgram.
        prevIndex = nGramMatchIndex;
      } else {
        // this means we found a break in a set of nGrams so we need to gather any data from
        // the startIndex and prevIndex and reset them
        if (prevIndex - startIndex > 0) {
          // this means we found an nGram larger than the default nGrams we are looking for set
          // by the size param of this function
          const n = prevIndex - startIndex + size;
          if (sourceTextsData[slug].largerSizedNGramMatches[n]) {
            sourceTextsData[slug].largerSizedNGramMatches[n].push(startIndex);
          } else {
            sourceTextsData[slug].largerSizedNGramMatches[n] = [startIndex];
          }
        }

        prevIndex = nGramMatchIndex;
        startIndex = nGramMatchIndex;
      }
    }
    // we need to check if the for loop ended on a larger sized nGram
    if (prevIndex - startIndex > 0) {
      // this means we found an nGram larger than the default nGrams we are looking for set
      // by the size param of this function
      const n = prevIndex - startIndex + size;
      if (sourceTextsData[slug].largerSizedNGramMatches[n]) {
        sourceTextsData[slug].largerSizedNGramMatches[n].push(startIndex);
      } else {
        sourceTextsData[slug].largerSizedNGramMatches[n] = [startIndex];
      }
    }
  }

  return { userTextData, sourceTextsData };
};

export {
  // eslint-disable-next-line import/prefer-default-export
  findNGrams,
};
