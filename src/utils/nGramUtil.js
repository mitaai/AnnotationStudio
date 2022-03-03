const hashTextArray = (arr) => {
  // this function takes a list of strings and processes them into one string that can be hashed
  // into a hash table
  const str = arr.reduce((previousValue, currentValue) => {
    const text = currentValue?.lemma || currentValue;
    return `${previousValue}_${text.toLowerCase()}`;
  }, '');
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
      uniqueNGramMatchesInUserTextData: {},
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
        obj.nGramHashToIndexes[nGramHash] = [i];
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
            if (!sourceTextsData[slug].uniqueNGramMatchesInUserTextData[nGramHash]) {
              sourceTextsData[slug].uniqueNGramMatchesInUserTextData[nGramHash] = true;
            }
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
  for (const [slug, data] of Object.entries(sourceTextsData)) {
    const {
      nGramMatchIndexesInUserTextData,
      uniqueNGramMatchesInUserTextData,
      nGramHashToIndexes,
    } = data;
    // first thing we will do is cacluate a similarity score between the source text and user text
    const uniqueNumberOfNGramHashes = Object.keys(nGramHashToIndexes).length;
    const uniqueNumberOfNGramMatches = Object.keys(uniqueNGramMatchesInUserTextData).length;
    const similarityScore = (uniqueNumberOfNGramMatches / uniqueNumberOfNGramHashes).toFixed(5);
    sourceTextsData[slug].similarityScore = similarityScore;

    // we need to make a new one because if we find higher nGrams then we don't need to record them
    // as multiple lower nGrams. For example if you find a 4-gram it will be recorded as 2 trigrams
    // which we don't need that double record
    const newNGramMatchIndexes = [];

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
        } else {
          // this means that this index is only an nGram and not a larger sized nGram
          newNGramMatchIndexes.push(startIndex);
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
    } else {
      // this means that this index is only an nGram and not a larger sized nGram
      newNGramMatchIndexes.push(startIndex);
    }

    // this saves nGram Matches that are not larger nGrams to nGramMatchIndexesInUserTextData
    sourceTextsData[slug].nGramMatchIndexesInUserTextData = newNGramMatchIndexes;
  }

  return { userTextData, sourceTextsData };
};

const toNGramStringArray = (nGramSize, processedTokens, removedStopWordsPTIndexes) => (index) => {
  const arr = [];
  for (let i = 0; i < nGramSize; i += 1) {
    const t = processedTokens[index + i].textContent;
    arr.push(t);
    if (removedStopWordsPTIndexes[index + i + 1]) {
      const stopWordText = removedStopWordsPTIndexes[index + i + 1].textContent;
      arr.push(stopWordText);
    }
  }

  return arr;
};

const getNGramTexts = ({ userTextAnalysisData, sourceTextsData, size }) => {
  const { processedTokens, removedStopWordsPTIndexes } = userTextAnalysisData;
  // so we will go through all the 'nGramMatchIndexesInUserTextData' in all the source texts
  const nGramTexts = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [slug, data] of Object.entries(sourceTextsData)) {
    const { nGramMatchIndexesInUserTextData, largerSizedNGramMatches } = data;
    const nSizeGramTexts = nGramMatchIndexesInUserTextData.map(
      toNGramStringArray(size, processedTokens, removedStopWordsPTIndexes),
    );

    const obj = {
      [size]: nSizeGramTexts,
    };

    // then we need to check if there are any nGrams larger than then default size
    // eslint-disable-next-line no-restricted-syntax
    for (const [nGramSize, startIndexes] of Object.entries(largerSizedNGramMatches)) {
      const largerSizedNGrams = startIndexes.map(
        toNGramStringArray(nGramSize, processedTokens, removedStopWordsPTIndexes),
      );

      obj[nGramSize] = largerSizedNGrams;
    }

    nGramTexts[slug] = obj;
  }

  return nGramTexts;
};


export {
  findNGrams,
  getNGramTexts,
};
