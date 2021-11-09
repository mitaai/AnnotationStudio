const FullName = (firstName, lastName) => `${firstName} ${lastName}`;
const FirstNameLastInitial = (fullName) => {
  const splitted = fullName.split(' ');
  const firstName = splitted[0]
  const lastInitial = splitted[1] === undefined ? '' : ` ${splitted[1][0]}.`
  return firstName + lastInitial
};

export { FullName, FirstNameLastInitial };
