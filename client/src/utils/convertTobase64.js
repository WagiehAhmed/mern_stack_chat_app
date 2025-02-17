export default function convertTobase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result); // Base64 string
    };
    reader.onerror = () => {
      reject(new Error("Error converting file to Base64"));
    };
    reader.readAsDataURL(file); // Read the image file as Data URL
  });
}
