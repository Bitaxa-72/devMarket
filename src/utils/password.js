const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const NUMBERS = '23456789';
const SYMBOLS = '!@#$%&*+-=?';
const ALL = LOWER + UPPER + NUMBERS + SYMBOLS;

function randomIndex(maximum) {
  const values = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / maximum) * maximum;
  let value;

  do {
    globalThis.crypto.getRandomValues(values);
    value = values[0];
  } while (value >= limit);

  return value % maximum;
}

function randomCharacter(characters) {
  return characters[randomIndex(characters.length)];
}

export function generatePassword(length = 20) {
  const safeLength = Math.max(12, Math.min(128, length));
  const characters = [
    randomCharacter(LOWER),
    randomCharacter(UPPER),
    randomCharacter(NUMBERS),
    randomCharacter(SYMBOLS),
  ];

  while (characters.length < safeLength) {
    characters.push(randomCharacter(ALL));
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const target = randomIndex(index + 1);
    [characters[index], characters[target]] = [
      characters[target],
      characters[index],
    ];
  }

  return characters.join('');
}

export function getPasswordRequirements(password) {
  return {
    length: password.length >= 12,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function getPasswordStrength(password) {
  const requirements = getPasswordRequirements(password);
  const score = Object.values(requirements).filter(Boolean).length;
  const level = !password ? 0 : Math.min(4, Math.max(1, score - 1));
  const labels = ['Введите пароль', 'Слабый', 'Средний', 'Хороший', 'Надёжный'];

  return { level, label: labels[level], requirements };
}
