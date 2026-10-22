import { useEffect } from "react";
import { armConfirmation, confirmationClock } from "../confirmation.js";

export function Confirmation({ message, onClear }) {
  useEffect(() => {
    if (!message) return undefined;
    const clock = confirmationClock();
    const id = armConfirmation(clock, onClear);
    return () => clock.clearTimeout(id);
  }, [message, onClear]);
  if (!message) return null;
  return (
    <p className="confirmation" role="status">
      {message}
    </p>
  );
}
