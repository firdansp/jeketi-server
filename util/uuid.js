// see http://stackoverflow.com/a/2117523/1333873 for details.
module.exports.uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    /* eslint-disable no-bitwise */
    const randomNumber = Math.random() * 16 | 0;
    const result = character === 'x' ? randomNumber : randomNumber & 0x3 | 0x8;
    /* eslint-enable no-bitwise */

    return result.toString(16);
  });
};
