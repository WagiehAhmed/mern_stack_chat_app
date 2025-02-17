export default function generateAltarnativeName(name) {
  const names = name?.split(" ");
  if (names.length > 1) return names[0][0] + names[1][0];
  if ((names.length = 1)) return names[0][0];
}
