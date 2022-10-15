const validBackgroundColors = [
  "bg-green-100",
  "bg-lime-100",
  "bg-yellow-100",
  "bg-red-100",
  "bg-blue-100",
  "bg-indigo-100",
  "bg-orange-100",
  "bg-pink-100",
  "bg-gray-100",
  "bg-purple-100",
  "bg-teal-100",
];

const validTextColors = [
  "text-green-900",
  "text-lime-900",
  "text-yellow-900",
  "text-red-900",
  "text-blue-900",
  "text-indigo-900",
  "text-orange-900",
  "text-pink-900",
  "text-gray-900",
  "text-purple-900",
  "text-teal-900",
];

export function classNamesForTagName(name: string) {
  const backgroundColor =
    validBackgroundColors[
      Math.abs(hashCode(name)) % validBackgroundColors.length
    ];
  const textColor =
    validTextColors[Math.abs(hashCode(name)) % validTextColors.length];

  return `${backgroundColor} ${textColor}`;
}

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
