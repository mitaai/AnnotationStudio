const FullName = (firstName, lastName) => `${firstName} ${lastName}`;
const FirstNameLastInitial = (fullName) => {
  const splitted = fullName.split(' ');
  return `${splitted[0]} ${splitted[1][0]}.`;
};

export { FullName, FirstNameLastInitial };
