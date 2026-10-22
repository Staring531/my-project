export function composingEnter(event) {
  return event.key === "Enter" && (event.isComposing || event.keyCode === 229);
}
