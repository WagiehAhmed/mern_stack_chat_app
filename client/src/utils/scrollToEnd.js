export default function scrollToEnd(ref) {
  if (ref?.current) {
    ref.current.scrollTop += ref.current.scrollHeight;
  }
}
